import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { CarouselSection } from '../../core/layout/models/section.model';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { ItemSearchResult } from '../object-collection/shared/item-search-result.model';

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
  findBitstream(item): any {
    return this.bitstreamDataService.findAllByItemAndBundleName(item, 'ORIGINAL').pipe(
      getFirstCompletedRemoteData(),
      map(projects => projects.payload.page.filter(proj => this.formatCheck(proj.metadata['dc.title'][0].value)))
    );
  }

  /**
   * to check the format of the image
   */
  formatCheck(stringToCheck) {
    const formats = ['.png', '.jpg', '.jpeg', '.apng', '.gif'];
    return formats.some(i => stringToCheck.includes(i));
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
