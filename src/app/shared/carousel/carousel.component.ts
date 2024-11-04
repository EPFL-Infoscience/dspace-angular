import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbSlideEvent, NgbSlideEventSource} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, concatMap, from, Observable, of } from 'rxjs';
import { filter, map, mergeMap, reduce, switchMap, take } from 'rxjs/operators';
import {PaginatedList} from '../../core/data/paginated-list.model';
import {BitstreamFormat} from '../../core/shared/bitstream-format.model';
import {Bitstream} from '../../core/shared/bitstream.model';
import {BitstreamDataService} from '../../core/data/bitstream-data.service';
import {getFirstCompletedRemoteData} from '../../core/shared/operators';
import { hasValue, isNotEmpty } from '../empty.util';
import {ItemSearchResult} from '../object-collection/shared/item-search-result.model';
import {followLink} from '../utils/follow-link-config.model';
import {RemoteData} from '../../core/data/remote-data';
import {CarouselOptions} from './carousel-options.model';
import {Item} from '../../core/shared/item.model';
import { SearchManager } from '../../core/browse/search-manager';
import { SearchObjects } from '../search/models/search-objects.model';
import { SortOptions } from '../../core/cache/models/sort-options.model';
import { PaginationComponentOptions } from '../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { DSpaceObjectType } from '../../core/shared/dspace-object-type.model';
import { InternalLinkService } from '../../core/services/internal-link.service';

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
   * Carousel section configurations.
   */
  @Input()
  carouselOptions: CarouselOptions;

  /**
   * Option to activate dependency between slide event and pagination
   */
  @Input()
  changePageOnSlide = false;

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
  @ViewChild('carousel', {static: false}) carousel: NgbCarousel;

  isLoading$ = new BehaviorSubject(true);

  /**
   * The total search item pages
   */
  totalPages = 0;
  /**
   * the total number of item available
   */
  totalItems = 0;

  /**
   * The map of the item to show
   */
  itemMap: Map<number,ItemSearchResult[]> = new Map();

  /**
   * The page number currently visualized
   */
  currentPage = 1;

  /**
   * Pages displayed in pagination controls
   */
  currentlyVisiblePages$: BehaviorSubject<(string| number)[]> = new BehaviorSubject<(string | number)[]>(null);

  /**
   * Items contained in currently active page
   */
  currentPageItems$: BehaviorSubject<ItemSearchResult[]> = new BehaviorSubject<ItemSearchResult[]>([]);

  /**
   * Number of pages to be shown in the pagination bar (boundaries excluded)
   * @private
   */

  private pagesToVisualize = 10;

  private paginationOptionId: string;



  constructor(
    protected bitstreamDataService: BitstreamDataService,
    private searchManager: SearchManager,
    public internalLinkService: InternalLinkService,
  ) {}

  ngOnInit() {
    this.title = this.carouselOptions.title;
    this.link = this.carouselOptions.link;
    this.description = this.carouselOptions.description;
    this.bundle = this.carouselOptions.bundle ?? 'ORIGINAL';
    this.paginationOptionId = 'carousel-search-' + this.carouselOptions.discoveryConfiguration;

    this.retrieveItems().pipe(
      mergeMap((searchResult: SearchObjects<Item>) => {
        if (isNotEmpty(searchResult)) {
          this.totalPages = searchResult.totalPages;
          this.totalItems = searchResult.totalElements;
          const items = searchResult.page;
          this.itemMap.set(searchResult.currentPage, items);
          this.isLoading$.next(true);
          return this.findAllBitstreamImages(items);
        } else {
          return null;
        }
      }),
      take(1)
    ).subscribe((res) => {
      this.itemToImageHrefMap$.next(res);
      this.currentlyVisiblePages$.next(this.getPagesToVisualize());
      this.currentPageItems$.next(this.getCurrentPageItems());
      this.isLoading$.next(false);
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

    if (this.changePageOnSlide) {
      const previousSlideIndex = parseInt(slideEvent.prev.split('-')[2], 10);
      const currentSlideIndex = parseInt(slideEvent.current.split('-')[2], 10);
      const direction = slideEvent.direction;
      const pageSlidesBounds = {
        min: (this.carouselOptions.numberOfItems * this.currentPage) - this.carouselOptions.numberOfItems,
        max: (this.carouselOptions.numberOfItems * this.currentPage)
      };
      const isPreviousIndexInCurrentPage = (previousSlideIndex + 1 >= pageSlidesBounds.min) && previousSlideIndex + 1 <= pageSlidesBounds.max;

      if (currentSlideIndex < previousSlideIndex && !(this.currentPage === this.totalPages)  && direction === 'left' && isPreviousIndexInCurrentPage) {
        this.changePage(this.currentPage + 1);
      } else if (previousSlideIndex < currentSlideIndex && direction === 'right' && this.currentPage !== 1 && isPreviousIndexInCurrentPage) {
        this.changePage(this.currentPage - 1);
      }
    }

  }

  /**
   * Find the first image of each item
   */
  findAllBitstreamImages(items: ItemSearchResult[]): Observable<Map<string, string>> {
    return from(items).pipe(
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
      reduce((acc: Map<string, string>, value: [string, string]) => {
        acc.set(value[0], value[1]);
        return acc;
      }, new Map<string, string>()),
    );
  }

  getItemLink(item: Item): string {
    return item.firstMetadataValue(this.link);
  }

  /**
   * Retrieve items by the given page number
   *
   * @param currentPage
   */
  retrieveItems(currentPage: number = 1): Observable<SearchObjects<Item>> {
    const pagination: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
      id: this.paginationOptionId,
      pageSize: this.carouselOptions.numberOfItems,
      currentPage: currentPage
    });

    const paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: this.carouselOptions.discoveryConfiguration,
      pagination: pagination,
      sort: new SortOptions(this.carouselOptions.sortField, this.carouselOptions.sortDirection),
      dsoTypes: [DSpaceObjectType.ITEM],
      forcedEmbeddedKeys: ['bundles']
    });
    return this.searchManager.search(paginatedSearchOptions).pipe(
      getFirstCompletedRemoteData(),
      map((searchResultsRD: RemoteData<SearchObjects<Item>>) => {
        if (searchResultsRD.hasSucceeded) {
          return searchResultsRD.payload;
        } else {
          return null;
        }
      })
    );
  }

  getCurrentPageItems(): ItemSearchResult[] {
    return this.itemMap.get(this.currentPage);
  }

  pages = () => {
    return Array.from({length: this.totalPages }, (_, i) => i + 1);
  };

  /**
   * return pages in scope for loading
   */
  getPagesToVisualize(): (string | number)[]  {
    const pagesArray = this.pages();
    let currentPagesInScope: (string | number)[] = this.currentPage > this.pagesToVisualize ?
      (
        this.currentPage - 1 + this.pagesToVisualize > this.totalPages ?
        [...pagesArray.slice(this.currentPage - this.pagesToVisualize, this.currentPage + this.pagesToVisualize)] :
        [...pagesArray.slice(this.currentPage - 1, this.currentPage + this.pagesToVisualize)]
      ) :
      [...pagesArray.slice(0, this.pagesToVisualize)];

    if (currentPagesInScope.some(page => page > this.pagesToVisualize)) {
      currentPagesInScope = [1, '...', ...currentPagesInScope];
      currentPagesInScope = currentPagesInScope.includes(this.totalPages) ? currentPagesInScope : [...currentPagesInScope, '...', this.totalPages];
    } else {
      currentPagesInScope = [1, ...currentPagesInScope.filter(page => page !== 1), '...', this.totalPages];
    }

    return currentPagesInScope;
  }
  previousPage = () => {
    if (this.currentPage > 1) {
      this.currentPage--;

      if (!this.itemMap.get(this.currentPage)) {
        this.isLoading$.next(true);
        this.retrieveMoreItems(this.currentPage);
      }
    }
  };

  nextPage = () => {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;

      if (!this.itemMap.get(this.currentPage)) {
        this.isLoading$.next(true);
        this.retrieveMoreItems(this.currentPage);
      }
    }
  };

  changePage = (page: number) => {
    this.currentPage = page;

    if (!this.itemMap.get(this.currentPage)) {
      this.isLoading$.next(true);
      this.retrieveMoreItems(this.currentPage);
    }
  };

  retrieveMoreItems(page: number) {
    of(page).pipe(
      concatMap((currentPage: number) => this.retrieveItems(currentPage).pipe(
        mergeMap((searchResult: SearchObjects<Item>) => {
          if (isNotEmpty(searchResult)) {
            const items = searchResult.page;
            this.itemMap.set(searchResult.currentPage, items);

            return this.findAllBitstreamImages(items);
          } else {
            return of(null);
          }
        }),
        take(1),
      )),
      reduce((itemToImageHrefMap, value) => {
        return new Map([...Array.from(itemToImageHrefMap.entries()), ...Array.from(value.entries())]);
      }, new Map()),
    ).subscribe((itemToImageHrefMap: Map<string,string>) => {
      if (isNotEmpty(itemToImageHrefMap)) {
        this.itemToImageHrefMap$.next(new Map([...Array.from(this.itemToImageHrefMap$.value.entries()), ...Array.from(itemToImageHrefMap.entries())]));
      }
      this.currentlyVisiblePages$.next(this.getPagesToVisualize());
      this.currentPageItems$.next(this.getCurrentPageItems());
      this.isLoading$.next(false);
    });
  }

}
