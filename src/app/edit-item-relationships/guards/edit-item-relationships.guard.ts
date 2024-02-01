import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';

import {combineLatest, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {isNotEmpty} from '../../shared/empty.util';

import {EditItemDataService} from '../../core/submission/edititem-data.service';
import {
  getAllSucceededRemoteDataPayload,
  getFirstCompletedRemoteData,
  getPaginatedListPayload
} from '../../core/shared/operators';
import {AuthService, LOGIN_ROUTE} from '../../core/auth/auth.service';
import {EditItemMode} from '../../core/submission/models/edititem-mode.model';
import {FeatureID} from '../../core/data/feature-authorization/feature-id';
import {AuthorizationDataService} from '../../core/data/feature-authorization/authorization-data.service';
import {DSpaceObjectDataService} from '../../core/data/dspace-object-data.service';

/**
 * Prevent unauthorized activating and loading of routes
 * @class AuthenticatedGuard
 */
@Injectable()
export class EditItemRelationsGuard implements CanActivate {

  /**
   * @constructor
   */
  constructor(private router: Router,
    private editItemService: EditItemDataService,
    private authService: AuthService,
    private authorizationService: AuthorizationDataService,
    private dSpaceObjectDataService: DSpaceObjectDataService,
  ) {
  }

  /**
   * True when user is authenticated
   * UrlTree with redirect to login page when user isn't authenticated
   * @method canActivate
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const url = state.url;
    return this.handleEditable(route.params.id, url);
  }

  /**
   * True when user is authenticated
   * UrlTree with redirect to login page when user isn't authenticated
   * @method canActivateChild
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivate(route, state);
  }

  private handleEditable(itemId: string, url: string): Observable<boolean | UrlTree> {
    // redirect to sign in page if user is not authenticated
    const editModes = this.editItemService.searchEditModesById(itemId).pipe(
      getAllSucceededRemoteDataPayload(),
      getPaginatedListPayload());


    const authorized = this.dSpaceObjectDataService.findById(itemId)
      .pipe(
        getFirstCompletedRemoteData(),
        switchMap((rd) => {
          if (rd.hasSucceeded) {
            return this.authorizationService.isAuthorized(FeatureID.CanManageRelationships, rd.payload.self);
          } else {
            return of(false);
          }
}));


    return combineLatest([editModes, authorized])
      .pipe(
        map(([modes, isAuthorized]: [EditItemMode[], boolean]) => {
          if (isAuthorized || (isNotEmpty(modes) && modes.length > 0)) {
            return true;
          } else {
            this.authService.setRedirectUrl(url);
            this.authService.removeToken();
            return this.router.createUrlTree([LOGIN_ROUTE]);
          }
        }),
      );
  }
}
