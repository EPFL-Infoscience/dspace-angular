import { DataService } from './data.service';
import { WorkflowAction } from '../tasks/models/workflow-action-object.model';
import { RequestService } from './request.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { Store } from '@ngrx/store';
import { CoreState } from '../core.reducers';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { DefaultChangeAnalyzer } from './default-change-analyzer.service';
import { FindListOptions } from './request.models';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { dataService } from '../cache/builders/build-decorators';
import { WORKFLOW_ACTION } from '../tasks/models/workflow-action-object.resource-type';

/**
 * A service responsible for fetching/sending data from/to the REST API on the workflowactions endpoint
 */
@Injectable()
@dataService(WORKFLOW_ACTION)
export class EmailTemplatesDataService extends DataService<WorkflowAction> {
  protected linkPath = 'emailtemplates';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DefaultChangeAnalyzer<WorkflowAction>) {
    super();
  }

  getBrowseEndpoint(options: FindListOptions, linkPath?: string): Observable<string> {
    return this.halService.getEndpoint(this.linkPath);
  }

}
