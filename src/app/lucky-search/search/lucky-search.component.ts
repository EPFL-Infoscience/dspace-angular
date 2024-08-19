import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {BehaviorSubject, mergeMap, Observable, of, Subject} from 'rxjs';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { SearchResult } from '../../shared/search/models/search-result.model';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { PaginatedSearchOptions } from '../../shared/search/models/paginated-search-options.model';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteData,
} from '../../core/shared/operators';
import { SearchFilter } from '../../shared/search/models/search-filter.model';
import { LuckySearchService } from '../lucky-search.service';
import { Params, Router } from '@angular/router';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Context } from '../../core/shared/context.model';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import { Item } from '../../core/shared/item.model';
import { BitstreamDataService, MetadataFilter } from '../../core/data/bitstream-data.service';
import { Bitstream } from '../../core/shared/bitstream.model';
import { hasValue, isEmpty, isNotEmpty } from '../../shared/empty.util';
import { getItemPageRoute } from '../../item-page/item-page-routing-paths';
import { getBitstreamDownloadRoute } from '../../app-routing-paths';
import {HardRedirectService} from '../../core/services/hard-redirect.service';
import {isPlatformServer} from '@angular/common';

@Component({
  selector: 'ds-lucky-search',
  templateUrl: './lucky-search.component.html',
  styleUrls: ['./lucky-search.component.scss']
})
export class LuckySearchComponent implements OnInit {
  /**
   * The current search results
   */
  resultsRD$: Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>>;
  /**
   * flag to show the result in case of no results from search
   */
  showEmptySearchSection$: Observable<boolean>;
  /**
   * flag to show the result in case of no results from multiple search
   */
  showMultipleSearchSection$: Observable<boolean>;
  /**
   * Search options to use for options of the search
   */
  searchOptions$: Observable<PaginatedSearchOptions>;
  /**
   * Current filter taken from url
   */
  currentFilter = {
    identifier: '',
    value: ''
  };
  context: Context = Context.ItemPage;

  private TITLE_METADATA = 'dc.title';
  private SOURCE_METADATA = 'dc.source';
  private DESCRIPTION_METADATA = 'dc.description';

  bitstreamFilters$ = new BehaviorSubject<MetadataFilter[]>(null);
  item$ = new Subject<Item>();
  bitstreams$: Observable<Bitstream[]>;


  constructor(
    private luckySearchService: LuckySearchService,
    private router: Router,
    private bitstreamDataService: BitstreamDataService,
    public searchConfigService: SearchConfigurationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private hardRedirectService: HardRedirectService,
  ) {}

  ngOnInit(): void {
    this.searchOptions$ = this.getSearchOptions();
    const urlTree = this.router.parseUrl(this.router.url);
    if (isNotEmpty(urlTree?.queryParams)) {
      const { queryParams } = urlTree;
      Object.keys(queryParams).forEach((key) => {
        if (key && key === 'index') {
          this.currentFilter.identifier = queryParams[key];
        }
        if (key && key === 'value') {
          this.currentFilter.value = queryParams[key];
        }
      });
      const value = this.parseBitstreamFilters(queryParams);
      this.bitstreamFilters$.next(value);
    } else {
      this.bitstreamFilters$.next([]);
    }

    if (!(this.currentFilter.value !== '' && this.currentFilter.identifier !== '')) {
      this.showEmptySearchSection$ = of(true);
      return;
    }

    this.resultsRD$ = this.searchOptions$.pipe(
      switchMap((options: PaginatedSearchOptions) => this.getLuckySearchResults(options)),
        switchMap(results => {
          if (this.hasBitstreamFilters() && results?.payload?.totalElements === 1) {
            const item = results.payload.page[0].indexableObject as Item;
            this.item$.next(item);
            return this.bitstreamFilters$.pipe(
              withLatestFrom(of(item)),
              mergeMap(([bitstreamFilters, itemOb]) => this.loadBitstreamsAndRedirectIfNeeded(itemOb, bitstreamFilters)),
              tap(bitstreams => {
                this.bitstreams$ = of(bitstreams);
                this.showEmptySearchSection$ = of(isEmpty(bitstreams));
                if (isNotEmpty(bitstreams) && bitstreams.length === 1) {
                  const bitstreamRoute = getBitstreamDownloadRoute(bitstreams[0]);
                  this.redirect(bitstreamRoute);
                }
              }),
              map(() => results)
            );
          } else if (!this.hasBitstreamFilters() && results?.payload?.totalElements === 1) {
            const item = results.payload.page[0].indexableObject as Item;
            this.item$.next(item);
            const route = getItemPageRoute(item);
            this.redirect(route);
          }
          return of(results);
        })
    );

    this.showEmptySearchSection$ = this.resultsRD$.pipe(
      map(results => {
        return results?.payload?.pageInfo?.totalElements === 0;
      })
    );

    this.showMultipleSearchSection$ = this.resultsRD$.pipe(
      map(results => {
        return results?.payload?.page?.length > 1;
      })
    );
  }

  private getLuckySearchResults(options: PaginatedSearchOptions): Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>> {
    options.filters = [new SearchFilter('f.' + this.currentFilter.identifier, [this.currentFilter.value], 'equals')];
    return this.luckySearchService.sendRequest(options).pipe(
      tap((rd: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => {
        if (rd && rd?.state === 'Error') {
          this.showEmptySearchSection$ = of(true);
        }
      }),
      getFirstSucceededRemoteData());
  }

  getDescription(bitstream: Bitstream): string {
    return bitstream.firstMetadataValue(this.DESCRIPTION_METADATA);
  }

  fileName(bitstream: Bitstream): string {
    const title = bitstream.firstMetadataValue(this.TITLE_METADATA);
    return hasValue(title) ? title : bitstream.firstMetadataValue(this.SOURCE_METADATA);
  }

  getSize(bitstream: Bitstream): number {
    return bitstream.sizeBytes;
  }

  private hasBitstreamFilters(): boolean {
    return this.bitstreamFilters$.getValue()?.length > 0;
  }

  private getSearchOptions(): Observable<PaginatedSearchOptions> {
    return this.searchConfigService.paginatedSearchOptions;
  }

  public redirect(url: string): void {
    if (isPlatformServer(this.platformId)) {
      this.hardRedirectService.redirect(url, 302);
    } else {
      this.router.navigateByUrl(url, { replaceUrl: true });
    }
  }

  private parseBitstreamFilters(queryParams: Params): MetadataFilter[] {
    const metadataName = queryParams?.bitstreamMetadata;
    const metadataValue = queryParams?.bitstreamValue;
    if (!!metadataName && !!metadataValue) {

      const metadataNames = Array.isArray(metadataName) ? metadataName : [metadataName];
      const metadataValues = Array.isArray(metadataValue) ? metadataValue : [metadataValue];

      return metadataNames.map((name, index) => ({
        metadataName: name,
        metadataValue: metadataValues[index]
      } as MetadataFilter));
    }
    return [];
  }

  private loadBitstreamsAndRedirectIfNeeded(item: Item, bitstreamFilters: MetadataFilter[]): Observable<Bitstream[]> {
    return this.bitstreamDataService.findByItem(item.uuid, 'ORIGINAL', bitstreamFilters, {})
      .pipe(
        getFirstCompletedRemoteData(),
        map(bitstreamsResult => bitstreamsResult.payload?.page),
      );
  }
}
