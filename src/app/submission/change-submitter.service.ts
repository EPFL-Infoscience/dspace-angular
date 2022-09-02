import { Injectable } from '@angular/core';
import { WorkspaceItem } from '../core/submission/models/workspaceitem.model';
import { Observable } from 'rxjs';
import { getFirstSucceededRemoteDataPayload } from '../core/shared/operators';
import { Item } from '../core/shared/item.model';
import { switchMap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { HttpOptions } from '../core/dspace-rest/dspace-rest.service';
import { ChangeSubmitterRestService } from '../core/submission/change-submitter-rest.service';

@Injectable()
export class ChangeSubmitterService {

  constructor(
    protected changeSubmitterRestService: ChangeSubmitterRestService,
  ) {
  }

  private readonly CHANGE_SUBMITTER_ACTION = 'changesubmitter';

  changeSubmitter(workspaceItem: WorkspaceItem, submitter: any): Observable<any> {
    const submitterId = encodeURI(submitter.email);
    return workspaceItem.item.pipe(
      getFirstSucceededRemoteDataPayload<Item>(),
      switchMap((item: Item) => this.postToEndpoint(submitterId, item, this.CHANGE_SUBMITTER_ACTION))
    );

  }

  private postToEndpoint(submitterId: string, item: Item, action: string) {
    const paramsObj = Object.create({});
    paramsObj.submitterIdentifier = submitterId;
    paramsObj.itemId = item.uuid;

    const params = new HttpParams({fromObject: paramsObj});
    const options: HttpOptions = Object.create({});
    options.params = params;

    return this.changeSubmitterRestService.postToEndpoint({}, action, options);
  }

  changeSubmitterItem(item: Item, submitter: any): Observable<any> {
    return this.postToEndpoint(encodeURI(submitter.email), item, this.CHANGE_SUBMITTER_ACTION);
  }

}
