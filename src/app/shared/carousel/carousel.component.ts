import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbSlideEvent, NgbSlideEventSource} from '@ng-bootstrap/ng-bootstrap';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {filter, map, mergeMap, scan, switchMap, take} from 'rxjs/operators';
import {PaginatedList} from '../../core/data/paginated-list.model';
import {BitstreamFormat} from '../../core/shared/bitstream-format.model';
import {Bitstream} from '../../core/shared/bitstream.model';
import {BitstreamDataService} from '../../core/data/bitstream-data.service';
import {NativeWindowRef, NativeWindowService} from '../../core/services/window.service';
import {getFirstCompletedRemoteData} from '../../core/shared/operators';
import {hasValue} from '../empty.util';
import {ItemSearchResult} from '../object-collection/shared/item-search-result.model';
import {followLink} from '../utils/follow-link-config.model';
import {RemoteData} from '../../core/data/remote-data';
import {CarouselOptions} from './carousel-options.model';
import {Item} from '../../core/shared/item.model';

/**
 * Component representing the Carousel component section.
 */
@Component({
  selector: 'ds-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: []
})
export class CarouselComponent implements OnInit {
  /**
   * Items to be used in carousel.
   */
  @Input()
  items: ItemSearchResult[];

  /**
   * Carousel section configurations.
   */
  @Input()
  carouselOptions: CarouselOptions;

  /**
   * Carousel section title field.
   */
  title: string;

  /**
   * Carousel section bundle field.
   */
  bundle: string;

  /**
   * Carousel section link field.
   */
  link: string;

  /**
   * Carousel section description field.
   */
  description: string;

  /**
   * Auto slider paused
   */
  paused = false;

  /**
   * Auto slider play on click of arrow
   */
  unpauseOnArrow = false;

  /**
   * Auto slider pause on click of Indicator
   */
  pauseOnIndicator = false;

  itemToImageHrefMap$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());

  /**
   * reference to the carousel
   */
  @ViewChild('carousel', {static: true}) carousel: NgbCarousel;

  isLoading$ = new BehaviorSubject(true);

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    @Inject(NativeWindowService) private _window: NativeWindowRef,
  ) {
  }

  ngOnInit() {
    this.title = this.carouselOptions.title;
    this.link = this.carouselOptions.link;
    this.description = this.carouselOptions.description;
    this.bundle = this.carouselOptions.bundle ?? 'ORIGINAL';

    this.findAllBitstreamImages().subscribe((res) => {
      this.itemToImageHrefMap$.next(res);
    });
  }

  /**
   * toggle function to play and pause carousel
   */
  togglePaused() {
    if (this.paused) {
      this.carousel.cycle();
    } else {
      this.carousel.pause();
    }
    this.paused = !this.paused;
  }

  /**
   * function to call on slide
   */
  onSlide(slideEvent: NgbSlideEvent) {
    if (this.unpauseOnArrow && slideEvent.paused &&
      (slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)) {
      this.togglePaused();
    }
    if (this.pauseOnIndicator && !slideEvent.paused && slideEvent.source === NgbSlideEventSource.INDICATOR) {
      this.togglePaused();
    }
  }

  /**
   * Find the first image of each item
   */
  findAllBitstreamImages(): Observable<Map<string, string>> {
    return from(this.items).pipe(
      map((itemSR) => itemSR.indexableObject),
      mergeMap((item) => this.bitstreamDataService.findAllByItemAndBundleName(
          item, this.bundle, {}, true, true, followLink('format'),
        ).pipe(
          getFirstCompletedRemoteData(),
          switchMap((rd: RemoteData<PaginatedList<Bitstream>>) => rd.hasSucceeded ? rd.payload.page : []),
          mergeMap((bitstream: Bitstream) => bitstream.format.pipe(
            getFirstCompletedRemoteData(),
            filter((bitstreamFormatRD: RemoteData<BitstreamFormat>) =>
              bitstreamFormatRD.hasSucceeded && hasValue(bitstreamFormatRD.payload) && hasValue(bitstream) &&
              bitstreamFormatRD.payload.mimetype.includes('image/')
            ),
            map(() => bitstream)
          )),
          take(1),
          map((bitstream: Bitstream) => [item.uuid, bitstream._links.content.href]),
        ),
      ),
      scan((acc: Map<string, string>, value: [string, string]) => {
        acc.set(value[0], value[1]);
        return acc;
      }, new Map<string, string>()),
    );
  }

  getItemLink(item: Item): string {
    return item.firstMetadataValue(this.link);
  }

  isLinkInternal(link: string) {
    return link.startsWith('/');
  }

  /**
   * to open a link of an item
   */
  openLinkUrl(url) {
    if (url && url[0].value) {
      this._window.nativeWindow.open(url[0].value, '_blank');
    }
  }

}
