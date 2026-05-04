import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import {
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  filter,
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { getForbiddenRoute } from '../app-routing-paths';
import { AuthService } from '../core/auth/auth.service';
import { BitstreamDataService } from '../core/data/bitstream-data.service';
import { AuthorizationDataService } from '../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../core/data/feature-authorization/feature-id';
import { RemoteData } from '../core/data/remote-data';
import { HardRedirectService } from '../core/services/hard-redirect.service';
import { redirectOn4xx } from '../core/shared/authorized.operators';
import { Bitstream } from '../core/shared/bitstream.model';
import { FileService } from '../core/shared/file.service';
import { getFirstCompletedRemoteData } from '../core/shared/operators';
import {
  hasValue,
  isNotEmpty,
} from '../shared/empty.util';
import { BITSTREAM_PAGE_LINKS_TO_FOLLOW } from './bitstream-page.resolver';

export const bitstreamDownloadRedirectGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  bitstreamDataService: BitstreamDataService = inject(BitstreamDataService),
  authorizationService: AuthorizationDataService = inject(AuthorizationDataService),
  auth: AuthService = inject(AuthService),
  fileService: FileService = inject(FileService),
  hardRedirectService: HardRedirectService = inject(HardRedirectService),
  router: Router = inject(Router),
): Observable<UrlTree | boolean> => {

  const bitstreamId = route.params.id;
  const accessToken: string = route.queryParams.accessToken;

  return bitstreamDataService.findById(bitstreamId, true, false, ...BITSTREAM_PAGE_LINKS_TO_FOLLOW).pipe(
    getFirstCompletedRemoteData(),
    redirectOn4xx(router, auth),
    switchMap((rd: RemoteData<Bitstream>) => {
      if (rd.hasSucceeded && !rd.hasNoContent) {
        const bitstream = rd.payload;
        const isAuthorized$ = authorizationService.isAuthorized(FeatureID.CanDownload, bitstream.self);
        const isLoggedIn$ = auth.isAuthenticated();
        return combineLatest([isAuthorized$, isLoggedIn$, of(bitstream)]);
      } else {
        return of([false, false, null]);
      }
    }),
    filter(([isAuthorized, isLoggedIn, _bitstream]: [boolean, boolean, Bitstream]) => hasValue(isAuthorized) && hasValue(isLoggedIn)),
    take(1),
    switchMap(([isAuthorized, isLoggedIn, bitstream]: [boolean, boolean, Bitstream]) => {
      if (!isAuthorized && !hasValue(accessToken)) {
        if (isLoggedIn) {
          return of(router.createUrlTree([getForbiddenRoute()]));
        }
        auth.setRedirectUrl(router.url);
        return of(router.createUrlTree(['login']));
      }

      if (!isAuthorized && hasValue(accessToken)) {
        const url = bitstream._links.content.href + '?accessToken=' + accessToken;
        hardRedirectService.redirect(url);
        return of(false);
      }

      // isAuthorized — resolve best download URL
      const contentHref = bitstream._links.content.href;
      const signedUrlHref = bitstream._links.signedurl?.href;

      if (isNotEmpty(signedUrlHref)) {
        return fileService.retrieveSignedUrl(signedUrlHref).pipe(
          take(1),
          switchMap((signedUrl: string | null) => {
            if (isNotEmpty(signedUrl)) {
              hardRedirectService.redirect(signedUrl);
              return of(false);
            }
            return resolveTokenOrPlainDownload(contentHref, isLoggedIn, fileService, hardRedirectService);
          }),
        );
      }

      return resolveTokenOrPlainDownload(contentHref, isLoggedIn, fileService, hardRedirectService);
    }),
  );
};

function resolveTokenOrPlainDownload(
  contentHref: string,
  isLoggedIn: boolean,
  fileService: FileService,
  hardRedirectService: HardRedirectService,
): Observable<boolean> {
  if (isLoggedIn) {
    return fileService.retrieveFileDownloadLink(contentHref).pipe(
      take(1),
      map((fileLink: string) => {
        hardRedirectService.redirect(fileLink);
        return false;
      }),
    );
  }
  hardRedirectService.redirect(contentHref);
  return of(false);
}
