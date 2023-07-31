import { Injectable } from '@angular/core';
import { AuthRequestService } from './auth-request.service';
import { PostRequest } from '../data/request.models';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { RequestService } from '../data/request.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { Observable, of as observableOf } from 'rxjs';
import { DspaceRestService } from '../dspace-rest/dspace-rest.service';

/**
 * Client side version of the service to send authentication requests
 */
@Injectable()
export class BrowserAuthRequestService extends AuthRequestService {

  constructor(
    halService: HALEndpointService,
    requestService: RequestService,
    rdbService: RemoteDataBuildService,
    restService: DspaceRestService
  ) {
    super(halService, requestService, rdbService, restService);
  }

  /**
   * Factory function to create the request object to send.
   *
   * @param href The href to send the request to
   * @protected
   */
  protected createShortLivedTokenRequest(href: string): Observable<PostRequest> {
    return observableOf(new PostRequest(this.requestService.generateRequestId(), href));
  }

}
