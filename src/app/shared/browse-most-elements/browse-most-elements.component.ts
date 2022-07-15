import { CollectionElementLinkType } from './../object-collection/collection-element-link.type';
import { isEqual } from 'lodash';
import { ViewMode } from './../../core/shared/view-mode.model';
import { ActivatedRoute, Params, Router, NavigationEnd } from '@angular/router';
import {
  LayoutModeEnum,
  TopSection,
} from './../../core/layout/models/section.model';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SearchService } from '../../core/shared/search/search.service';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { SearchResult } from '../search/models/search-result.model';
import { Context } from '../../core/shared/context.model';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { hasValue } from '../empty.util';

@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html',
})
export class BrowseMostElementsComponent implements OnInit {
  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  @Input() topSection: TopSection;

  @Input() mode: LayoutModeEnum;

  searchResults: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>;

  public cardLayoutMode = LayoutModeEnum.CARD;

  public collectionElementLinkTypeEnum = CollectionElementLinkType;

  constructor(
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private aroute: ActivatedRoute,
  ) {
    /* */
  }

  ngOnInit() {
    this.getSearchResults();
  }

  private getSearchResults() {
    this.searchService
      .search(this.paginatedSearchOptions)
      .pipe(getFirstCompletedRemoteData())
      .subscribe(
        (response: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => {
          this.searchResults = response as any;
          this.cdr.detectChanges();
        }
      );
  }

  async showAllResults() {
    const view = isEqual(this.mode, LayoutModeEnum.LIST)
      ? ViewMode.ListElement
      : ViewMode.GridElement;
    await this.router.navigate(['/search'], {
      queryParams: {
        configuration: this.paginatedSearchOptions.configuration,
        view: view,
      },
      replaceUrl: true,
    });
  }

  onPaginationChange() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.aroute.queryParams
          .subscribe((params: Params) => {
            if (hasValue(params['search-object-pagination.page'])) {
              let pagination = Object.assign(new PaginatedSearchOptions(this.paginatedSearchOptions), {
                ...this.paginatedSearchOptions,
                pagination: {
                  ...this.paginatedSearchOptions.pagination,
                  currentPage: params['search-object-pagination.page']
                }
              });
              this.paginatedSearchOptions = pagination;
              this.getSearchResults();
            }
          });
      }
    });
  }
}
