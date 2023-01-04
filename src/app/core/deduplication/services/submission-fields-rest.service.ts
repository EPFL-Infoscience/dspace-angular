/* eslint-disable max-classes-per-file */
import { switchMap } from 'rxjs/operators';
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

import { DataService } from '../../data/data.service';
import { dataService } from '../../cache/builders/build-decorators';
import { SubmissionFieldsObject } from '../models/submission-fields.model';
import { SUBMISSION_FIELDS } from '../models/submission-fields.resource-type';
import { Observable } from 'rxjs';
import { RemoteData } from '../../data/remote-data';
import { CoreState } from '../../core-state.model';

/**
 * A private DataService implementation to delegate specific methods to.
 */
class DataServiceImpl extends DataService<SubmissionFieldsObject> {
  /**
   * The REST endpoint.
   */
  protected linkPath = 'submissionfields';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: ChangeAnalyzer<SubmissionFieldsObject>) {
    super();
  }
}

@Injectable()
@dataService(SUBMISSION_FIELDS)
export class SubmissionFieldsRestService {
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
   * @param {DefaultChangeAnalyzer<SubmissionFieldsObject>} comparator
   */
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<SubmissionFieldsObject>) {
    this.dataService = new DataServiceImpl(requestService, rdbService, null, objectCache, halService, notificationsService, http, comparator);
  }

  /**
   * GET the submission repeatable & nested metadata fields for the given item UUID
   * @param itemUuid The item's uuid
   * @param linksToFollow List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved.
   * @returns The object with the given uuid and a list of repeatable fields
   */
  public getSubmissionFields(itemUuid: string): Observable<RemoteData<SubmissionFieldsObject>> {
    const searchmethod = `search/findByItem`;
    return this.dataService.getBrowseEndpoint().pipe(
      switchMap((href: string) => {
        return this.dataService.findByHref(`${href}/${searchmethod}?uuid=${itemUuid}`, false, true);
      })
    );
  }
}
