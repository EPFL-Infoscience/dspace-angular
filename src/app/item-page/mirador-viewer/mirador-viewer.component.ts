import { ChangeDetectionStrategy, Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Item } from '../../core/shared/item.model';
import { environment } from '../../../environments/environment';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { isPlatformBrowser, Location } from '@angular/common';
import { MiradorViewerService } from './mirador-viewer.service';
import { HostWindowService, WidthCategory } from '../../shared/host-window.service';
import { BundleDataService } from '../../core/data/bundle-data.service';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';

const IFRAME_UPDATE_URL_MESSAGE = 'update-url';

interface IFrameMessageData {
  type: string;
  canvasId: string;
  canvasIndex: string;
}

@Component({
  selector: 'ds-mirador-viewer',
  styleUrls: ['./mirador-viewer.component.scss'],
  templateUrl: './mirador-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ MiradorViewerService ]
})
export class MiradorViewerComponent implements OnInit, OnDestroy {

  @Input() object: Item;

  /**
   * A previous dspace search query.
   */
  @Input() query: string;

  /**
   * True if searchable.
   */
  @Input() searchable: boolean;

  /**
   * Is used as canvas identifier of the element to show.
   */
  @Input() canvasId: string;

  /**
   * Is used as canvas index of the element to show.
   */
  @Input() canvasIndex: string;

  /**
   * Hides embedded viewer in dev mode.
   */
  isViewerAvailable = true;

  /**
   * The url for the iframe.
   */
  iframeViewerUrl: Observable<SafeResourceUrl>;

  /**
   * Sets the viewer to show or hide thumbnail side navigation menu.
   */
  multi = false;

  /**
   * Hides the thumbnail navigation menu on smaller viewports.
   */
  notMobile = false;

  viewerMessage = 'Sorry, the Mirador viewer is not currently available in development mode.';

  constructor(
    private sanitizer: DomSanitizer,
    private viewerService: MiradorViewerService,
    private bitstreamDataService: BitstreamDataService,
    private bundleDataService: BundleDataService,
    private hostWindowService: HostWindowService,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
  ) {

  }

  /**
   * Creates the url for the Mirador iframe. Adds parameters for the displaying the search panel, query results,
   * or  multi-page thumbnail navigation.
   */
  setURL() {
    // The path to the REST manifest endpoint.
    const manifestApiEndpoint = encodeURIComponent(environment.rest.baseUrl + '/iiif/'
      + this.object.id + '/manifest');
    // The Express path to Mirador viewer.
    let viewerPath = `${environment.ui.nameSpace}${environment.ui.nameSpace.length > 1 ? '/' : ''}`
      + `iiif/mirador/index.html?manifest=${manifestApiEndpoint}`;
    if (this.searchable) {
      // Tell the viewer add search to menu.
      viewerPath += '&searchable=' + this.searchable;
    }
    if (this.query) {
      // Tell the viewer to execute a search for the query term.
      viewerPath += '&query=' + this.query;
    }
    if (this.multi) {
      // Tell the viewer to add thumbnail navigation. If searchable, thumbnail navigation is added by default.
      viewerPath += '&multi=' + this.multi;
    }
    if (this.notMobile) {
      viewerPath += '&notMobile=true';
    }
    if (this.canvasId) {
      viewerPath += `&canvasId=${this.canvasId}`;
    }
    if (this.canvasIndex) {
      viewerPath += `&canvasIndex=${parseInt(this.canvasIndex, 10) - 1}`;
    }
    if (environment.mirador.enableDownloadPlugin) {
      viewerPath += '&enableDownloadPlugin=true';
    }

    // TODO: Should the query term be trusted here?
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewerPath);
  }

  ngOnInit(): void {
    /**
     * Initializes the iframe url observable.
     */
    if (isPlatformBrowser(this.platformId)) {
      this._window.nativeWindow.addEventListener('message', this.iframeMessageListener);

      // Viewer is not currently available in dev mode so hide it in that case.
      this.isViewerAvailable = this.viewerService.showEmbeddedViewer();

      // The notMobile property affects the thumbnail navigation
      // menu by hiding it for smaller viewports. This will not be
      // responsive to resizing.
      this.hostWindowService.widthCategory
          .pipe(take(1))
          .subscribe((category: WidthCategory) => {
            this.notMobile = !(category === WidthCategory.XS || category === WidthCategory.SM);
          });

      // Set the multi property. The default mirador configuration adds a right
      // thumbnail navigation panel to the viewer when multi is 'true'.

      // Set the multi property to 'true' if the item is searchable.
      if (this.searchable) {
        this.multi = true;
        const observable = of('');
        this.iframeViewerUrl = observable.pipe(
          map((val) => {
            return this.setURL();
          })
        );
      } else {
        // Set the multi property based on the image count in IIIF-eligible bundles.
        // Any count greater than 1 sets the value to 'true'.
        this.iframeViewerUrl = this.viewerService.getImageCount(
          this.object,
          this.bitstreamDataService,
          this.bundleDataService).pipe(
          map(c => {
            if (c > 1) {
              this.multi = true;
            }
            return this.setURL();
          })
        );
      }
    }
  }

  ngOnDestroy(): void {
    this._window.nativeWindow.removeEventListener('message', this.iframeMessageListener);
  }

  iframeMessageListener = (event: MessageEvent) => {
    const data: IFrameMessageData = event.data;

    if (data.type === IFRAME_UPDATE_URL_MESSAGE) {
      const currentPath = this.location.path();
      const canvasId = data.canvasId;
      const canvasIndex = data.canvasIndex;
      // Use URL API for easier query param manipulation
      const url = new URL(window.location.origin + currentPath);
      // Set or update the query param
      url.searchParams.set('canvasId', canvasId);
      url.searchParams.set('canvasIndex', canvasIndex);
      const newPathWithQuery = url.pathname + url.search;
      // Replace the current state (no reload, no new history entry)
      this.location.replaceState(newPathWithQuery);
    }
  };
}
