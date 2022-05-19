import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SortDirection, SortOptions } from '../../../../core/cache/models/sort-options.model';
import { PaginatedList } from '../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../core/data/remote-data';
import { DSpaceObjectType } from '../../../../core/shared/dspace-object-type.model';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';
import { SearchService } from '../../../../core/shared/search/search.service';
import { PaginationComponentOptions } from '../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../../../search/models/paginated-search-options.model';
import { SearchResult } from '../../../search/models/search-result.model';
import { CarouselSection } from '../../../../core/layout/models/section.model';

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
  /**
   * The id of the current section.
   */
  @Input()
  sectionId: string;

  /**
   * Carousel section configurations.
   */
  @Input()
  carouselSection: CarouselSection;

  /**
   * Search results of provided carousel configurations.
   */
  searchResults: Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>>;

  /**
   * Paginated Search Options of current carousel configurations.
   */
  paginatedSearchOptions: PaginatedSearchOptions;

  /**
   * Loader before results appear
   */
  isLoading$ = new BehaviorSubject(true);

  constructor (
    private searchService: SearchService,
    ) {
  }

  ngOnInit() {
    const discoveryConfigurationName = this.carouselSection.discoveryConfigurationName;
    const order = this.carouselSection.order;
    const sortField = this.carouselSection.sortField;
    const numberOfItems = this.carouselSection.numberOfItems;
    const sortDirection = order && order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;
    const pagination: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
      id: 'carousel-object-pagination',
      pageSize: numberOfItems,
      currentPage: 1
    });

    this.paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: discoveryConfigurationName,
      pagination: pagination,
      sort: new SortOptions(sortField, sortDirection),
      dsoTypes: [DSpaceObjectType.ITEM],
      forcedEmbeddedKeys: ['bundles']
    });

    this.searchResults = this.searchService.search(this.paginatedSearchOptions).pipe(
      getFirstCompletedRemoteData(),
    );
    this.searchResults.subscribe(() => this.isLoading$.next(false));
  }

}
