import { switchMap } from 'rxjs/operators';
import { FollowLinkConfig } from './../../../shared/utils/follow-link-config.model';
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

import { DataService } from '../../data/data.service';
import { dataService } from '../../cache/builders/build-decorators';
import { SubmissionRepeatableFieldsObject } from '../models/submission-repeatable-fields.model';
import { SUBMISSION_REPEATABLE_FIELDS } from '../models/submission-repeatable-fields.resource-type';
import { Observable } from 'rxjs';
import { RemoteData } from '../../data/remote-data';

/* tslint:disable:max-classes-per-file */

/**
 * A private DataService implementation to delegate specific methods to.
 */
class DataServiceImpl extends DataService<SubmissionRepeatableFieldsObject> {
  /**
   * The REST endpoint.
   */
  protected linkPath = 'submissionrepeatablefields';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: ChangeAnalyzer<SubmissionRepeatableFieldsObject>) {
    super();
  }
}

@Injectable()
@dataService(SUBMISSION_REPEATABLE_FIELDS)
export class SubmissionRepeatableFieldsRestService {
  /**
   * A private DataService implementation to delegate specific methods to.
   */
  private dataService: DataServiceImpl;

  protected searchFindByItem = 'search/findByItem';

  /**
   * Initialize service variables
   * @param {RequestService} requestService
   * @param {RemoteDataBuildService} rdbService
   * @param {ObjectCacheService} objectCache
   * @param {HALEndpointService} halService
   * @param {NotificationsService} notificationsService
   * @param {HttpClient} http
   * @param {DefaultChangeAnalyzer<SubmissionRepeatableFieldsObject>} comparator
   */
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<SubmissionRepeatableFieldsObject>) {
    this.dataService = new DataServiceImpl(requestService, rdbService, null, objectCache, halService, notificationsService, http, comparator);
  }

  /**
   * GET the submission repeatable fields for the given item UUID
   * @param itemUuid The item's uuid
   * @param linksToFollow List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved.
   * @returns The object with the given uuid and a list of repeatable fields
   */
  public getSubmissionRepeatableFields(itemUuid: string, ...linksToFollow: FollowLinkConfig<SubmissionRepeatableFieldsObject>[]):Observable<RemoteData<SubmissionRepeatableFieldsObject>> {
    return this.dataService.getBrowseEndpoint().pipe(
      switchMap((href: string) => {
        let searchmethod = `${this.searchFindByItem}?uuid=${itemUuid}`;
        return this.dataService.findByHref(`${href}/${searchmethod}`, false, true, ...linksToFollow);
      })
    );
  }
}
