import { FindListOptions } from './../../data/find-list-options.model';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { RequestService } from '../../data/request.service';
import { Injectable } from '@angular/core';
import { SubmissionFieldsObject } from '../models/submission-fields.model';
import { SUBMISSION_FIELDS } from '../models/submission-fields.resource-type';
import { Observable, switchMap } from 'rxjs';
import { RemoteData } from '../../data/remote-data';
import { dataService } from '../../data/base/data-service.decorator';
import { IdentifiableDataService } from '../../data/base/identifiable-data.service';
import { SearchDataImpl } from '../../data/base/search-data';
import { PaginatedList } from '../../data/paginated-list.model';
import { getFirstCompletedRemoteData } from '../../shared/operators';

@Injectable()
@dataService(SUBMISSION_FIELDS)
export class SubmissionFieldsRestService extends IdentifiableDataService<SubmissionFieldsObject>{
  /**
   * The REST endpoint.
   */
  protected linkPath = 'submissionfields';
  private searchData: SearchDataImpl<SubmissionFieldsObject>;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService
  ) {
    super('submissionfields', requestService, rdbService, objectCache, halService);

    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  /**
   * GET the submission repeatable & nested metadata fields for the given item UUID
   * @param itemUuid The item's uuid
   * @param linksToFollow List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved.
   * @returns The object with the given uuid and a list of repeatable fields
   */
  public getSubmissionFields(itemUuid: string, options: FindListOptions) {
    const searchmethod = `search/findByItem`;

    // this.searchData.searchBy('findByItem', options, false, true).pipe(
    //   getFirstCompletedRemoteData()
    // );

    return this.searchData.getBrowseEndpoint().pipe(
      switchMap((href: string) => {
        return this.searchData.findByHref(`${href}/${searchmethod}?uuid=${itemUuid}`, false, true);
      })
    );

    // return this.dataService.getBrowseEndpoint().pipe(
    //   switchMap((href: string) => {
    //     return this.dataService.findByHref(`${href}/${searchmethod}?uuid=${itemUuid}`, false, true);
    //   })
    // );
  }
}
