import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of, switchMap} from 'rxjs';
import {Injectable} from '@angular/core';
import {DSpaceObjectDataService} from '../../core/data/dspace-object-data.service';
import {AuthorizationDataService} from '../../core/data/feature-authorization/authorization-data.service';
import {getFirstCompletedRemoteData} from '../../core/shared/operators';
import {FeatureID} from '../../core/data/feature-authorization/feature-id';
import {map} from 'rxjs/operators';
import {AuthService} from '../../core/auth/auth.service';
import {FORBIDDEN_PATH} from '../../app-routing-paths';


@Injectable({
  providedIn: 'root'
})
export class ItemStatisticsGuard implements CanActivate {

  constructor(private dSpaceObjectDataService: DSpaceObjectDataService,
              private authorizationService: AuthorizationDataService,
              private authService: AuthService,
              private router: Router) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const url = state.url;
    return this.handleAuthorization(route.params.id, url);
  }

  private handleAuthorization(dsoId: string, url: string): Observable<boolean | UrlTree> {
    const authorized = this.dSpaceObjectDataService.findById(dsoId)
      .pipe(
        getFirstCompletedRemoteData(),
        switchMap((rd) => {
          if (rd.hasSucceeded) {
            return this.authorizationService.isAuthorized(FeatureID.CanViewUsageStatistics, rd.payload.self);
          } else {
            return of(false);
          }
}));

    return authorized.pipe(
      map((isAuthorized: boolean) => {
        if (isAuthorized) {
          return true;
        }
        this.authService.setRedirectUrl(url);
        this.authService.removeToken();
        return this.router.createUrlTree([FORBIDDEN_PATH]);
      })
    );
  }
}
