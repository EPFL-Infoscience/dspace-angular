import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, filter, take } from 'rxjs/operators';

import { BitstreamDataService } from '../core/data/bitstream-data.service';
import { RemoteData } from '../core/data/remote-data';
import { HardRedirectService } from '../core/services/hard-redirect.service';
import { Bitstream } from '../core/shared/bitstream.model';
import { getFirstCompletedRemoteData } from '../core/shared/operators';
import { hasValue, isEmpty, isNotEmpty } from '../shared/empty.util';
import { AuthorizationDataService } from '../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../core/data/feature-authorization/feature-id';
import { AuthService } from '../core/auth/auth.service';
import { getForbiddenRoute } from '../app-routing-paths';
import { FileService } from '../core/shared/file.service';
import { BITSTREAM_PAGE_LINKS_TO_FOLLOW } from './bitstream-page.resolver';
import { redirectOn4xx } from '../core/shared/authorized.operators';

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
  const authenticationMethod: string = route.queryParams.authenticationMethod;

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
        hardRedirectService.redirect(buildUrlWithAuthMethod(url, authenticationMethod));
        const blockResolvingRoute = !!(router.getCurrentNavigation()?.extras?.state?.blockResolvingBitstreamPageRoute);
        return of(!blockResolvingRoute);
      }

      // isAuthorized — resolve best download URL
      const contentHref = bitstream._links.content.href;
      const signedUrlHref = bitstream._links.signedurl?.href;
      const blockResolvingRoute = !!(router.getCurrentNavigation()?.extras?.state?.blockResolvingBitstreamPageRoute);

      if (isNotEmpty(signedUrlHref) && isEmpty(authenticationMethod)) {
        return fileService.retrieveSignedUrl(signedUrlHref).pipe(
          take(1),
          switchMap((signedUrl: string | null) => {
            if (isNotEmpty(signedUrl)) {
              hardRedirectService.redirect(signedUrl);
              return of(!blockResolvingRoute);
            }
            return resolveTokenOrPlainDownload(contentHref, isLoggedIn, fileService, hardRedirectService, !blockResolvingRoute, authenticationMethod);
          }),
        );
      }

      return resolveTokenOrPlainDownload(contentHref, isLoggedIn, fileService, hardRedirectService, !blockResolvingRoute, authenticationMethod);
    }),
  );
};

/**
 * Append authenticationMethod query param to the URL, using ? or & as needed
 */
function buildUrlWithAuthMethod(url: string, authenticationMethod): string {
  if (!hasValue(authenticationMethod)) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return url + separator + 'authenticationMethod=' + authenticationMethod;
}

function resolveTokenOrPlainDownload(
  contentHref: string,
  isLoggedIn: boolean,
  fileService: FileService,
  hardRedirectService: HardRedirectService,
  resolve: boolean,
  authenticationMethod: string,
): Observable<boolean> {
  if (isLoggedIn) {
    return fileService.retrieveFileDownloadLink(contentHref).pipe(
      take(1),
      map((fileLink: string) => {
        hardRedirectService.redirect(buildUrlWithAuthMethod(fileLink, authenticationMethod));
        return resolve;
      }),
    );
  }
  hardRedirectService.redirect(buildUrlWithAuthMethod(contentHref, authenticationMethod));
  return of(resolve);
}
