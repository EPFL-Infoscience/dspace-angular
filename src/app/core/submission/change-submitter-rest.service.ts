import { Injectable } from '@angular/core';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestService } from '../data/request.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { HttpOptions } from '../dspace-rest/dspace-rest.service';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap, tap } from 'rxjs/operators';
import { isNotEmpty } from '../../shared/empty.util';
import { PostRequest, SubmissionPostRequest } from '../data/request.models';
import { SubmissionResponse } from './submission-response.model';
import { getFirstCompletedRemoteData } from '../shared/operators';
import { RemoteData } from '../data/remote-data';

@Injectable()
export class ChangeSubmitterRestService {
  protected linkPath = 'changesubmitter';


  constructor(
    protected rdbService: RemoteDataBuildService,
    protected requestService: RequestService,
    protected halService: HALEndpointService) {
  }

  protected getEndpoint(templatedLink, action): string {
    const templateRegex = /{\?[^(?{})]*}$/;
    const link = templatedLink.replace(templateRegex,'');
    return isNotEmpty(action) ? `${link}/${action}` : `${link}`;
  }

  protected fetchRequest(requestId: string): Observable<boolean> {
    return this.rdbService.buildFromRequestUUID<SubmissionResponse>(requestId).pipe(
      getFirstCompletedRemoteData(),
      map((response: RemoteData<SubmissionResponse>) => response.hasSucceeded),
      distinctUntilChanged()
    );
  }

  public postToEndpoint(body: any, action?: string, options?: HttpOptions): Observable<boolean> {
    const requestId = this.requestService.generateRequestId();
    return this.halService.getEndpoint(this.linkPath).pipe(
      filter((href: string) => isNotEmpty(href)),
      map((baseEndpointURL: string) => this.getEndpoint(baseEndpointURL, action)),
      map((endpointURL: string) => new SubmissionPostRequest(requestId, endpointURL, body, options)),
      tap((request: PostRequest) => this.requestService.send(request)),
      mergeMap(() => this.fetchRequest(requestId)),
      distinctUntilChanged(),
    );
  }

}
