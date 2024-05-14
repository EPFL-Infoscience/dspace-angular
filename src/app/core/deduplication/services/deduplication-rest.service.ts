import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RequestService } from '../../data/request.service';
import { RemoteData } from '../../data/remote-data';
import { SignatureObject } from '../models/signature.model';
import { SIGNATURE_OBJECT } from '../models/signature-object.resource-type';
import { FollowLinkConfig } from '../../../shared/utils/follow-link-config.model';
import { PaginatedList } from '../../data/paginated-list.model';
import { FindListOptions } from '../../data/find-list-options.model';
import { IdentifiableDataService } from '../../data/base/identifiable-data.service';
import { dataService } from '../../data/base/data-service.decorator';
import { SearchDataImpl } from '../../data/base/search-data';


/**
 * The service handling all deduplication REST requests.
 */
@Injectable()
@dataService(SIGNATURE_OBJECT)
export class DeduplicationRestService extends IdentifiableDataService<SignatureObject>{
  /**
   * A private DataService implementation to delegate specific methods to.
   */
  private searchData: SearchDataImpl<SignatureObject>;

  protected linkPath = 'signatures';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
  ) {
    super('signatures', requestService, rdbService, objectCache, halService);

    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
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
    return this.searchData.getBrowseEndpoint(options).pipe(
      take(1),
      mergeMap((href: string) => this.searchData.findListByHref(href, options, false, true, ...linksToFollow)),
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
  public getSignature(id: string, options?: FindListOptions, ...linksToFollow: FollowLinkConfig<SignatureObject>[]): Observable<RemoteData<SignatureObject>> {
    return this.searchData.getBrowseEndpoint(options).pipe(
      take(1),
      mergeMap((href: string) => this.searchData.findByHref(`${href}/${id}`, false, true, ...linksToFollow))
    );
  }
}
