import { getFirstCompletedRemoteData } from './../../shared/operators';
import { PaginatedList } from './../../data/paginated-list.model';
import { FollowLinkConfig } from './../../../shared/utils/follow-link-config.model';
import { FindListOptions } from './../../data/request.models';
import { DefaultChangeAnalyzer } from './../../data/default-change-analyzer.service';
import { ChangeAnalyzer } from './../../data/change-analyzer';
import { NotificationsService } from './../../../shared/notifications/notifications.service';
import { HALEndpointService } from './../../shared/hal-endpoint.service';
import { ObjectCacheService } from './../../cache/object-cache.service';
import { CoreState } from './../../core.reducers';
import { RemoteDataBuildService } from './../../cache/builders/remote-data-build.service';
import { RequestService } from './../../data/request.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { SetObject } from './set.model';
import { DataService } from '../../data/data.service';
import { dataService } from '../../cache/builders/build-decorators';
import { DEDUPLICATION_SET } from './deduplication-set.resource-type';
import { RemoteData } from '../../data/remote-data';
import { isNil } from 'lodash';
import { NoContent } from '../../shared/NoContent.model';

/* tslint:disable:max-classes-per-file */

/**
 * A private DataService implementation to delegate specific methods to.
 */
class DataServiceImpl extends DataService<SetObject> {
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
    protected comparator: ChangeAnalyzer<SetObject>) {
    super();
  }
}

/**
 * The service handling all deduplication REST requests.
 */
@Injectable()
@dataService(DEDUPLICATION_SET)
export class DeduplicationSetsRestService {
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
   * @param {DefaultChangeAnalyzer<SetObject>} comparator
   */
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<SetObject>) {
    this.dataService = new DataServiceImpl(requestService, rdbService, null, objectCache, halService, notificationsService, http, comparator);
  }

  /**
   * Return the list of all deduplication sets for the given signature.
   * @param options Find list options object.
   * @param signatureId The id of the signature to retrieve the sets for.
   * @param rule The rule to filter the sets by.
   * @param linksToFollow List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved.
   * @returns List of sets for the given signature.
   */
  public getSetsPerSignature(options: FindListOptions = {}, signatureId: string, rule?: string, ...linksToFollow: FollowLinkConfig<SetObject>[]): Observable<RemoteData<PaginatedList<SetObject>>> {
    return this.dataService.getBrowseEndpoint(options).pipe(
      take(1),
      mergeMap((href: string) => {
        let searchmethod = `sets/search/findBySignature?signature-id=${signatureId}`;
        if (!isNil(rule)) {
          searchmethod = searchmethod + `&rule=${rule}`;
        }
        return this.dataService.findAllByHref(`${href}?${searchmethod}`, options, false, true, ...linksToFollow);
      })
    );
  }

  /**
   * Delete the given signature set.
   * @param signatureId The id of the signature to which the set belongs.
   * @param checksum
   */
  public deleteSet(signatureId: string, checksum: string): Observable<RemoteData<NoContent>> {
    return this.dataService.delete(`${signatureId}:${checksum}`).pipe(
      getFirstCompletedRemoteData(),
      take(1)
    );
  }
}
