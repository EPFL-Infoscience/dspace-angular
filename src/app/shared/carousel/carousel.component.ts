import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import { BitstreamFormat } from '../../core/shared/bitstream-format.model';
import { Bitstream } from '../../core/shared/bitstream.model';
import { Item } from '../../core/shared/item.model';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { CarouselSection } from '../../core/layout/models/section.model';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { hasValue } from '../empty.util';
import { ItemSearchResult } from '../object-collection/shared/item-search-result.model';
import { followLink } from '../utils/follow-link-config.model';

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
  carouselSection: CarouselSection;

  /**
   * Carousel section discovery Configuration.
   */
  discoveryConfiguration: string;

  /**
   * Carousel section title field.
   */
  title: string;

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

  /**
   * reference to the carousel
   */
  @ViewChild('carousel', {static : true}) carousel: NgbCarousel;

  isLoading$ = new BehaviorSubject(true);

  constructor (
    protected bitstreamDataService: BitstreamDataService,
    @Inject(NativeWindowService) private _window: NativeWindowRef,
    ) {
  }

  ngOnInit() {
    this.discoveryConfiguration = this.carouselSection.discoveryConfigurationName;
    this.title = this.carouselSection.title;
    this.link = this.carouselSection.link;
    this.description = this.carouselSection.description;
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
   * function to find a bitstream of an item
   */
  findBitstream(item: Item) {
    return this.bitstreamDataService.findAllByItemAndBundleName(
      item,
      'ORIGINAL',
      {elementsPerPage: 20, currentPage: 0},
      true,
      true,
      followLink('format'),
    ).pipe(
      getFirstCompletedRemoteData(),
      map((bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) => {
        if (hasValue(bitstreamsRD.payload)) {
          if ( bitstreamsRD.payload.page.length > 0) {
            const finalBitstreams = bitstreamsRD.payload.page.filter((bitstream: Bitstream) => {
              if (hasValue(bitstream)) {
                if (hasValue(bitstream.format)) {
                  let formatCheck;
                  bitstream.format.pipe(
                    map((format) => format.payload),
                    map((format: BitstreamFormat) => {
                      if (hasValue(format)) {
                        if (hasValue(format.mimetype)) {
                          if (format.mimetype.includes('image')) {
                            return true;
                          } else { return false; }
                        } else {return false; }
                      } else {return false; }
                    }),
                  ).subscribe(res => { formatCheck = res; });
                  return formatCheck;
                } else { return false; }
              } else { return false; }
            });
            return finalBitstreams;
          } else { return null; }
        } else { return null; }
      }),
    );
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
