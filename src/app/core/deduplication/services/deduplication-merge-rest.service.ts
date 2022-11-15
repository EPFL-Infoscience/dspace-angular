/* eslint-disable max-classes-per-file */
import { mergeMap } from 'rxjs/operators';
import { DefaultChangeAnalyzer } from './../../data/default-change-analyzer.service';
import { MERGE_OBJECT } from './../models/merge-object.resource-type';
import { RemoteDataBuildService } from './../../cache/builders/remote-data-build.service';
import { RequestService } from './../../data/request.service';
import { Injectable } from '@angular/core';
import { DataService } from '../../data/data.service';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { NotificationsService } from './../../../shared/notifications/notifications.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { CoreState } from '../../core-state.model';
import { ChangeAnalyzer } from '../../data/change-analyzer';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { MergeObject } from '../models/merge-object.model';
import { dataService } from '../../cache/builders/build-decorators';
import { Observable } from 'rxjs';
import { RemoteData } from '../../data/remote-data';

/**
 * A private DataService implementation to delegate specific methods to.
 */
class DataServiceImpl extends DataService<MergeObject> {
  /**
   * The REST endpoint.
   */
  protected linkPath = 'merge';

  /**
   * Initialize service variables
   * @param {RequestService} requestService
   * @param {RemoteDataBuildService} rdbService
   * @param {Store<CoreState>} store
   * @param {ObjectCacheService} objectCache
   * @param {HALEndpointService} halService
   * @param {NotificationsService} notificationsService
   * @param {HttpClient} http
   * @param {ChangeAnalyzer<MergeObject>} comparator
   */
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: ChangeAnalyzer<MergeObject>
  ) {
    super();
  }
}

@Injectable()
@dataService(MERGE_OBJECT)
export class DeduplicationMergeRestService {
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
   * @param {DefaultChangeAnalyzer<MergeObject>} comparator
   */
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<MergeObject>
  ) {
    this.dataService = new DataServiceImpl(
      requestService,
      rdbService,
      null,
      objectCache,
      halService,
      notificationsService,
      http,
      comparator
    );
  }

  public mergeItemsData(data: any, targetItemId: string): Observable<RemoteData<MergeObject>> {
    return this.halService.getEndpoint(this.dataService.getLinkPath()).pipe(
      mergeMap(endpoint => {
        // TODO: Change the request object after REST changes
        const object = {
          ...data,
          _links: {
            self: {
              href: `${endpoint}/${targetItemId}`
            },
          },
        } as MergeObject;
        return this.dataService.put(object);
      })
    );
  }
}
