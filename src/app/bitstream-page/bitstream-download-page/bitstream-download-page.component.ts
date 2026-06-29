import { isPlatformServer, Location, } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import { Observable, } from 'rxjs';
import { map, startWith, switchMap, take, } from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { isNotEmpty } from '../../shared/empty.util';
import { getRemoteDataPayload } from '../../core/shared/operators';
import { Bitstream } from '../../core/shared/bitstream.model';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { FileService } from '../../core/shared/file.service';
import { RemoteData } from '../../core/data/remote-data';
import { SignpostingDataService } from '../../core/data/signposting-data.service';
import { SignpostingLink } from '../../core/data/signposting-links.model';
import { ServerResponseService } from '../../core/services/server-response.service';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../../core/services/window.service';

@Component({
  selector: 'ds-bitstream-download-page',
  templateUrl: './bitstream-download-page.component.html'
})
/**
 * Page component for downloading a bitstream
 */
export class BitstreamDownloadPageComponent implements OnInit {

  bitstream$: Observable<Bitstream>;
  bitstreamRD$: Observable<RemoteData<Bitstream>>;

  fileName$: Observable<string>;

  hasHistory = this._window.nativeWindow.history?.length > 1;

  constructor(
    @Inject(NativeWindowService) private _window: NativeWindowRef,
    private route: ActivatedRoute,
    protected router: Router,
    private authorizationService: AuthorizationDataService,
    private auth: AuthService,
    private fileService: FileService,
    private location: Location,
    public dsoNameService: DSONameService,
    private signpostingDataService: SignpostingDataService,
    private responseService: ServerResponseService,
    @Inject(PLATFORM_ID) protected platformId: string
  ) {
    this.initPageLinks();
  }

  back(): void {
    this.location.back();
  }

  close(): void {
    this._window.nativeWindow.self.close();
  }

  ngOnInit(): void {
    this.bitstreamRD$ = this.route.data.pipe(
      map((data) => data.bitstream)
    );

    this.bitstream$ = this.bitstreamRD$.pipe(
      getRemoteDataPayload()
    );

    this.fileName$ = this.bitstream$.pipe(
      map((bitstream: Bitstream) => this.dsoNameService.getName(bitstream)),
      startWith('file')
    );

    this.startDownload();
  }

  /**
   * Resolve a downloadable URL and trigger download without leaving this route.
   */
  private startDownload(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.bitstream$.pipe(
      take(1),
      switchMap((bitstream: Bitstream) => this.resolveDownloadTarget(bitstream)),
      switchMap((downloadTarget: DownloadTarget | null) => {
        if (!downloadTarget) {
          return of(downloadTarget);
        }

        if (!downloadTarget.useNamedDownload) {
          return of(downloadTarget);
        }

        return from(this.tryDownloadWithFileName(downloadTarget.url, downloadTarget.fileName)).pipe(
          map((downloaded: boolean) => (downloaded ? null : downloadTarget)),
          catchError(() => of(downloadTarget)),
        );
      }),
      take(1),
    ).subscribe((downloadTarget: DownloadTarget | null) => {
      if (downloadTarget && isNotEmpty(downloadTarget.url)) {
        this.triggerDownloadInBackground(downloadTarget.url);
      }
    });
  }

  private resolveDownloadTarget(bitstream: Bitstream): Observable<DownloadTarget | null> {
    const contentHref = bitstream._links.content.href;
    const accessToken: string | null = this.route.snapshot.queryParamMap.get('accessToken');
    const fileName = this.resolveFileName(bitstream);

    return combineLatest([
      this.authorizationService.isAuthorized(FeatureID.CanDownload, bitstream.self),
      this.auth.isAuthenticated(),
    ]).pipe(
      take(1),
      switchMap(([isAuthorized, isLoggedIn]: [boolean, boolean]) => {
        if (isAuthorized) {
          return this.fileService.retrieveSignedUrl(contentHref).pipe(
            take(1),
            switchMap((signedUrl: string | null) => {
              if (isNotEmpty(signedUrl)) {
                return of({ url: signedUrl, fileName, useNamedDownload: true });
              }
              if (isLoggedIn) {
                return this.fileService.retrieveFileDownloadLink(contentHref).pipe(
                  take(1),
                  map((fileLink: string) => ({ url: fileLink, fileName, useNamedDownload: false })),
                );
              }
              return of({ url: contentHref, fileName, useNamedDownload: false });
            }),
          );
        }

        if (isNotEmpty(accessToken)) {
          return of({ url: contentHref + '?accessToken=' + accessToken, fileName, useNamedDownload: false });
        }

        return of(null);
      }),
    );
  }

  private resolveFileName(bitstream: Bitstream): string {
    const name = this.dsoNameService.getName(bitstream);
    return isNotEmpty(name) ? name : 'file';
  }

  private async tryDownloadWithFileName(downloadUrl: string, fileName: string): Promise<boolean> {
    const response = await this._window.nativeWindow.fetch(downloadUrl);
    if (!response?.ok) {
      return false;
    }

    const blob = await response.blob();
    saveAs(blob, fileName);
    return true;
  }

  private triggerDownloadInBackground(downloadUrl: string): void {
    const body = this._window.nativeWindow.document?.body;
    if (!body) {
      return;
    }

    const iframe = this._window.nativeWindow.document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    body.appendChild(iframe);

    // Cleanup the temporary element after download start.
    this._window.nativeWindow.setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 60000);
  }

  /**
   * Create page links if any are retrieved by signposting endpoint
   *
   * @private
   */
  private initPageLinks(): void {
    if (isPlatformServer(this.platformId)) {
      this.route.params.subscribe(params => {
        this.signpostingDataService.getLinks(params.id).pipe(take(1)).subscribe((signpostingLinks: SignpostingLink[]) => {
          let links = '';

          signpostingLinks.forEach((link: SignpostingLink) => {
            links = links + (isNotEmpty(links) ? ', ' : '') + `<${link.href}> ; rel="${link.rel}"` + (isNotEmpty(link.type) ? ` ; type="${link.type}" ` : ' ');
          });
          this.responseService.setHeader('Link', links);
        });
      });
    }
  }
}

interface DownloadTarget {
  url: string;
  fileName: string;
  useNamedDownload: boolean;
}

