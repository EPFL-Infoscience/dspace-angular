/* eslint-disable max-classes-per-file */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { dataService } from '../../cache/builders/build-decorators';
import { RequestService } from '../../data/request.service';
import { DataService } from '../../data/data.service';
import { ChangeAnalyzer } from '../../data/change-analyzer';
import { DefaultChangeAnalyzer } from '../../data/default-change-analyzer.service';
import { RemoteData } from '../../data/remote-data';
import { SignatureObject } from '../models/signature.model';
import { SIGNATURE_OBJECT } from '../models/signature-object.resource-type';
import { FollowLinkConfig } from '../../../shared/utils/follow-link-config.model';
import { PaginatedList } from '../../data/paginated-list.model';
import { CoreState } from '../../core-state.model';
import { FindListOptions } from '../../data/find-list-options.model';


/**
 * A private DataService implementation to delegate specific methods to.
 */
class DataServiceImpl extends DataService<SignatureObject> {
  /**
   * The REST endpoint.
   */
  protected linkPath = 'signatures';

  /**
   * Initialize service variables
   * @param {RequestService} requestService
   * @param {RemoteDataBuildService} rdbService
   * @param {Store<CoreState>} store
   * @param {ObjectCacheService} objectCache
   * @param {HALEndpointService} halService
   * @param {NotificationsService} notificationsService
   * @param {HttpClient} http
   * @param {ChangeAnalyzer<SignatureObject>} comparator
   */
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: ChangeAnalyzer<SignatureObject>) {
    super();
  }
}

/**
 * The service handling all deduplication REST requests.
 */
@Injectable()
@dataService(SIGNATURE_OBJECT)
export class DeduplicationRestService {
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
   * @param {DefaultChangeAnalyzer<SignatureObject>} comparator
   */
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<SignatureObject>) {
    this.dataService = new DataServiceImpl(requestService, rdbService, null, objectCache, halService, notificationsService, http, comparator);
  }

  /**
   * Return the list of deduplication signatures.
   *
   * @param options
   *    Find list options object.
   * @param linksToFollow
   *    List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved.
   * @return Observable<RemoteData<PaginatedList<SignatureObject>>>
   *    The list of deduplication signatures.
   */
  public getSignatures(options: FindListOptions = {}, ...linksToFollow: FollowLinkConfig<SignatureObject>[]): Observable<RemoteData<PaginatedList<SignatureObject>>> {
    return this.dataService.getBrowseEndpoint(options).pipe(
      take(1),
      mergeMap((href: string) => this.dataService.findAllByHref(href, options, false, true, ...linksToFollow)),
    );
  }

  /**
   * Return a single deduplication signature.
   *
   * @param id            The deduplication signature id
   * @param linksToFollow List of {@link FollowLinkConfig} that indicate which
   *                      {@link HALLink}s should be automatically resolved
   * @return Observable<RemoteData<SignatureObject>>
   *    The list of deduplication signatures.
   */
  public getSignature(id: string, ...linksToFollow: FollowLinkConfig<SignatureObject>[]): Observable<RemoteData<SignatureObject>> {
    const options = {};
    return this.dataService.getBrowseEndpoint(options).pipe(
      take(1),
      mergeMap((href: string) => this.dataService.findByHref(href + '/' + id, false, true, ...linksToFollow))
    );
  }
}
