/* eslint-disable max-classes-per-file */
import { PaginatedList } from '../../data/paginated-list.model';
import { FollowLinkConfig } from '../../../shared/utils/follow-link-config.model';
import { DefaultChangeAnalyzer } from '../../data/default-change-analyzer.service';
import { ChangeAnalyzer } from '../../data/change-analyzer';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
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
import { DEDUPLICATION_SET_ITEMS } from '../models/deduplication-set-items.resource-type';
import { NoContent } from '../../shared/NoContent.model';
import { getFirstCompletedRemoteData } from '../../shared/operators';
import { Item } from '../../shared/item.model';
import { CoreState } from '../../core-state.model';
import { FindListOptions } from '../../data/find-list-options.model';



/**
 * A private DataService implementation to delegate specific methods to.
 */
class DataServiceImpl extends DataService<Item> {
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
    protected comparator: ChangeAnalyzer<Item>
  ) {
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
   * @param {DefaultChangeAnalyzer<Item>} comparator
   */
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<Item>
  ) {
    this.dataService = new DataServiceImpl(requestService, rdbService, null, objectCache, halService, notificationsService, http, comparator);
  }

  /**
   * Returns the list of items for the given set.
   * @param options Find list options object.
   * @param setId The set id to get the items for.
   * @param linksToFollow  List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved.
   * @returns The list of set items.
   */
  public getItemsPerSet(options: FindListOptions = {}, setId: string, ...linksToFollow: FollowLinkConfig<Item>[]): Observable<RemoteData<PaginatedList<Item>>> {
    return this.dataService.getBrowseEndpoint(options).pipe(
      take(1),
      mergeMap((href: string) => {
        return this.dataService.findAllByHref(`${href}/${setId}/items`, options, false, true, ...linksToFollow);
      })
    );
  }

  /**
   * On 'No duplicate' remove the given set item.
   * @param signatureId The id of the signature to which the set items belong.
   * @param itemId The id of the item to delete.
   */
  public removeItem(signatureId: string, itemId: string, seChecksum: string): Observable<RemoteData<NoContent>> {
    return this.dataService.delete(`${signatureId}:${seChecksum}/items/${itemId}`).pipe(
      getFirstCompletedRemoteData(),
      take(1)
    );
  }
}
