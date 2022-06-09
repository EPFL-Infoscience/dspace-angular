import { PaginatedList } from '../../data/paginated-list.model';
import { FollowLinkConfig } from '../../../shared/utils/follow-link-config.model';
import { FindListOptions } from '../../data/request.models';
import { DefaultChangeAnalyzer } from '../../data/default-change-analyzer.service';
import { ChangeAnalyzer } from '../../data/change-analyzer';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { CoreState } from '../../core.reducers';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { RequestService } from '../../data/request.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { DataService } from '../../data/data.service';
import { dataService } from '../../cache/builders/build-decorators';
import { RemoteData } from '../../data/remote-data';
import { SetItemsObject } from './set-items.model';
import { DEDUPLICATION_SET_ITEMS } from './deduplication-set-items.resource-type';
import { NoContent } from '../../shared/NoContent.model';

/**
 * A private DataService implementation to delegate specific methods to.
 */
class DataServiceImpl extends DataService<SetItemsObject> {
  /**
   * The REST endpoint.
   */
  protected linkPath = 'sets';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: ChangeAnalyzer<SetItemsObject>) {
    super();
  }
}

/**
 * The service handling all deduplication REST requests.
 */
@Injectable()
@dataService(DEDUPLICATION_SET_ITEMS)
export class DeduplicationSetItemsRestService {
  /**
   * A private DataService implementation to delegate specific methods to.
   */
  private dataService: DataServiceImpl;

  /**
   * Initialize service variables
   * @param {RequestService} requestService
   * @param {RemoteDataBuildService} rdbService
   * @param {ObjectCacheService} objectCache
   * @param {HALEndpointService} halService
   * @param {NotificationsService} notificationsService
   * @param {HttpClient} http
   * @param {DefaultChangeAnalyzer<SetItemsObject>} comparator
   */
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<SetItemsObject>) {
    this.dataService = new DataServiceImpl(requestService, rdbService, null, objectCache, halService, notificationsService, http, comparator);
  }

  public getItemsPerSet(options: FindListOptions = {}, setId: string, ...linksToFollow: FollowLinkConfig<SetItemsObject>[]): Observable<RemoteData<PaginatedList<SetItemsObject>>> {
    return this.dataService.getBrowseEndpoint(options).pipe(
      take(1),
      mergeMap((href: string) => {
        return this.dataService.findAllByHref(`${href}/${setId}/items`, options, false, true, ...linksToFollow);
      })
    );
  }

  public deleteItem(signatureId: string, item: string): Observable<RemoteData<NoContent>> {
    return this.dataService.delete(`${signatureId}/items/${item}`).pipe(
      take(1),
    );
  }
}
