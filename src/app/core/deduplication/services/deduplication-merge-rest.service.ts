import { PutData } from './../../data/base/put-data';
import { mergeMap } from 'rxjs/operators';
import { MERGE_OBJECT } from './../models/merge-object.resource-type';
import { RemoteDataBuildService } from './../../cache/builders/remote-data-build.service';
import { RequestService } from './../../data/request.service';
import { Injectable } from '@angular/core';
import { NotificationsService } from './../../../shared/notifications/notifications.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { MergeObject } from '../models/merge-object.model';
import { IdentifiableDataService } from '../../data/base/identifiable-data.service';
import { PutDataImpl } from '../../data/base/put-data';
import { SearchDataImpl } from '../../data/base/search-data';
import { dataService } from '../../data/base/data-service.decorator';
import { RemoteData } from '../../data/remote-data';
import { Observable } from 'rxjs';

@Injectable()
@dataService(MERGE_OBJECT)
export class DeduplicationMergeRestService extends IdentifiableDataService<MergeObject> implements PutData<MergeObject>{

  /**
   * A private DataService implementation to delegate specific methods to.
   */
  private searchData: SearchDataImpl<MergeObject>;
  private putData: PutDataImpl<MergeObject>;

  protected linkPath = 'merge';
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
  ) {
    super('bitstreams', requestService, rdbService, objectCache, halService);
    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
    this.putData = new PutDataImpl<MergeObject>(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  /**
   * Updates the item with the new values from the merge
   * @param data (of type MergeObject), the merged object
   * @param targetItemId the id if the target item (the first item in the list)
   * @returns {Observable<RemoteData<MergeObject>> } the merged object
   */
  public mergeItemsData(data: any, targetItemId: string): Observable<RemoteData<MergeObject>> {
    return this.halService.getEndpoint(this.searchData.getLinkPath()).pipe(
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
        return this.putData.put(object);
      })
    );
  }

  // TODO: replace after the first method is refactor
  put(data: MergeObject): Observable<RemoteData<MergeObject>> {
    return this.putData.put(data);
  }
}
