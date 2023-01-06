import { getFirstCompletedRemoteData } from '../../shared/operators';
import { FollowLinkConfig } from '../../../shared/utils/follow-link-config.model';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { RequestService } from '../../data/request.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap, switchMap, take } from 'rxjs/operators';
import { SetObject } from '../models/set.model';
import { DEDUPLICATION_SET } from '../models/deduplication-set.resource-type';
import { RemoteData } from '../../data/remote-data';
import { NoContent } from '../../shared/NoContent.model';
import { FindListOptions } from '../../data/find-list-options.model';
import { IdentifiableDataService } from '../../data/base/identifiable-data.service';
import { SearchDataImpl } from '../../data/base/search-data';
import { DeleteDataImpl } from '../../data/base/delete-data';
import { dataService } from '../../data/base/data-service.decorator';
import { PaginatedList } from '../../data/paginated-list.model';

/**
 * The service handling deduplication sets REST requests.
 */
@Injectable()
@dataService(DEDUPLICATION_SET)
export class DeduplicationSetsRestService extends IdentifiableDataService<SetObject>  {

  protected linkPath = 'sets';

  private searchData: SearchDataImpl<SetObject>;

  private deleteData: DeleteDataImpl<SetObject>;
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService) {

    super('sets', requestService, rdbService, objectCache, halService);
    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
    this.deleteData = new DeleteDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, notificationsService, this.responseMsToLive, this.constructIdEndpoint);
  }

  /**
   * Return the list of all deduplication sets for the given signature.
   * @param options Find list options object.
   * @param linksToFollow List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved.
   * @returns List of sets for the given signature.
   */
  public getSetsfindBySignature(
    options: FindListOptions = {},
    ...linksToFollow: FollowLinkConfig<SetObject>[]
  ): Observable<RemoteData<PaginatedList<SetObject>>> {
    return this.searchData
      .getSearchByHref(`findBySignature`, options, ...linksToFollow)
      .pipe(
        take(1),
        mergeMap((href: string) => {
          return this.searchData.findListByHref(
            href,
            options,
            false,
            true,
            ...linksToFollow
          );
        })
      );
  }

  /**
   * Return the list of all deduplication sets for the given signature and rule.
   * @param options Find list options object.
   * @param linksToFollow List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved.
   * @returns List of sets for the given signature.
   */
  public getSetsPerSignature(
    options: FindListOptions = {},
    ...linksToFollow: FollowLinkConfig<SetObject>[]
  ): Observable<RemoteData<PaginatedList<SetObject>>> {
    const searchmethod = `findBySignatureAndRule`;
    return this.searchData
      .getSearchByHref(`${searchmethod}`, options, ...linksToFollow)
      .pipe(
        take(1),
        mergeMap((href: string) => {
          return this.searchData.findListByHref(
            href,
            options,
            false,
            true,
            ...linksToFollow
          );
        })
      );
  }

  /**
   * Delete the given signature set.
   * @param signatureId The id of the signature to which the set belongs.
   * @param checksum
   */
  public deleteSet(
    signatureId: string,
    checksum: string
  ): Observable<RemoteData<NoContent>> {
    return this.deleteData
      .delete(`${signatureId}:${checksum}`)
      .pipe(getFirstCompletedRemoteData());
  }

  /**
 * On 'No duplicate' remove the given set item.
 * @param signatureId The id of the signature to which the set items belong.
 * @param itemId The id of the item to delete.
 */
  public removeItem(signatureId: string, itemId: string, seChecksum: string): Observable<RemoteData<NoContent>> {
    return this.searchData.getBrowseEndpoint().pipe(
      switchMap((href: string) => {
        return this.deleteData.deleteByHref(`${href}/${signatureId}:${seChecksum}/items/${itemId}`);
      })
    );
  }
}
