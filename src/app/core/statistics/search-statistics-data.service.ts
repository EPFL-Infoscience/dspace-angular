import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { dataService } from '../data/base/data-service.decorator';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestParam } from '../cache/models/request-param.model';
import { ObjectCacheService } from '../cache/object-cache.service';
import { PaginatedList } from '../data/paginated-list.model';
import { RemoteData } from '../data/remote-data';
import { RequestService } from '../data/request.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { SEARCH_STATISTICS } from './models/search-statistics.resource-type';
import { SearchDataImpl } from '../data/base/search-data';
import { IdentifiableDataService } from '../data/base/identifiable-data.service';
import {SearchStatistics} from './models/search-statistics.model';


@Injectable()
@dataService(SEARCH_STATISTICS)
export class SearchStatisticsDataService extends IdentifiableDataService<SearchStatistics> {

  protected linkPath = 'searches';

  private searchData: SearchDataImpl<SearchStatistics>;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService
  ) {
    super('searches', requestService, rdbService, objectCache, halService);

    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  searchByDateRange(startDate: string, endDate: string): Observable<RemoteData<PaginatedList<SearchStatistics>>> {

    const searchParams: RequestParam[] = [];
    if (startDate) {
      searchParams.push(new RequestParam('startDate', startDate));
    }

    if (endDate) {
      searchParams.push(new RequestParam('endDate', endDate));
    }

    return this.searchData.searchBy('byDateRange', {
      elementsPerPage: 1,
      searchParams: searchParams
    }, false);

  }
}
