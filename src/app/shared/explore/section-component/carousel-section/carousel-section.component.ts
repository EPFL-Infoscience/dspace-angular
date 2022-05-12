import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SortDirection, SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { BitstreamDataService } from 'src/app/core/data/bitstream-data.service';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { NativeWindowRef, NativeWindowService } from 'src/app/core/services/window.service';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from 'src/app/shared/search/models/paginated-search-options.model';
import { SearchResult } from 'src/app/shared/search/models/search-result.model';
import { CarouselSection } from '../../../../core/layout/models/section.model';
import { SearchFilterConfig } from '../../../search/models/search-filter-config.model';

/**
 * Component representing the Carousel component section.
 */
@Component({
    selector: 'ds-carousel-section',
    templateUrl: './carousel-section.component.html',
    styleUrls: ['./carousel-section.component.scss'],
    providers: []
})
export class CarouselSectionComponent implements OnInit {

  @Input()
  sectionId: string;

  @Input()
  carouselSection: CarouselSection;

  discoveryConfiguration: string;
  title: string;
  link: string;
  description: string;

  carousels: SearchFilterConfig[] = [];
  carousels$ = new BehaviorSubject(this.carousels);

  searchResults: Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>>;
  paginatedSearchOptions: PaginatedSearchOptions;


  images = [62, 83, 466, 965, 982, 1043, 738].map((n) => `https://picsum.photos/id/${n}/900/500`);

  paused = false;
  unpauseOnArrow = false;
  pauseOnIndicator = false;
  @ViewChild('carousel', {static : true}) carousel: NgbCarousel;

  constructor (
    private searchService: SearchService,
    protected bitstreamDataService: BitstreamDataService,
    @Inject(NativeWindowService) private _window: NativeWindowRef,
    ) {
  }

  ngOnInit() {
    this.discoveryConfiguration = this.carouselSection.discoveryConfigurationName;
    this.title = this.carouselSection.title;
    this.link = this.carouselSection.link;
    this.description = this.carouselSection.description;

    const sortDirection = SortDirection.ASC;
    const pagination: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
      id: 'carousel-object-pagination',
      pageSize: 20,
      currentPage: 1
    });

    this.paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: this.discoveryConfiguration,
      pagination: pagination,
      sort: new SortOptions(this.title, sortDirection),
      dsoTypes: [DSpaceObjectType.ITEM],
      forcedEmbeddedKeys: ['bundles']
    });

    this.searchResults = this.searchService.search(this.paginatedSearchOptions).pipe(
      getFirstCompletedRemoteData(),
    );
  }

  togglePaused() {
    if (this.paused) {
      this.carousel.cycle();
    } else {
      this.carousel.pause();
    }
    this.paused = !this.paused;
  }

  onSlide(slideEvent: NgbSlideEvent) {
    if (this.unpauseOnArrow && slideEvent.paused &&
      (slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)) {
      this.togglePaused();
    }
    if (this.pauseOnIndicator && !slideEvent.paused && slideEvent.source === NgbSlideEventSource.INDICATOR) {
      this.togglePaused();
    }
  }

  findBitstream(item): any {
    return this.bitstreamDataService.findAllByItemAndBundleName(item, 'ORIGINAL').pipe(
      getFirstCompletedRemoteData(),
      map(projects => projects.payload.page.filter(proj => this.formatCheck(proj.metadata['dc.title'][0].value)))
    );
  }

  formatCheck(stringToCheck) {
    const formats = ['.png', '.jpg', '.jpeg', '.apng', '.gif'];
    return formats.some(i => stringToCheck.includes(i));
  }

  openLinkUrl(url) {
    if (url && url[0].value) {
      this._window.nativeWindow.open(url[0].value, '_blank');
    }
  }

}
