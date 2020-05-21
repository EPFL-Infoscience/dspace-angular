import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RemoteData } from '../core/data/remote-data';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { FindListOptions } from '../core/data/request.models';
import { DeduplicationRestService } from '../core/deduplication/deduplication-rest.service';

/**
 * A service that provides methods used in submission process.
 */
@Injectable()
export class SubmissionService {

  /**
   * Initialize service variables
   * @param {GlobalConfig} EnvConfig
   * @param {NotificationsService} notificationsService
   * @param {SubmissionRestService} restService
   * @param {Router} router
   * @param {RouteService} routeService
   * @param {Store<SubmissionState>} store
   * @param {TranslateService} translate
   * @param {SearchService} searchService
   * @param {RequestService} requestService
   */
  constructor(protected restService: DeduplicationRestService,
  ) {
  }

  /**
   * Perform a REST call to retrieve the list of deduplication signatures and return response
   *
   * @param options The [[FindListOptions]] object (pagination options)
   * @return Observable<RemoteData<SignatureObject[]>>
   *    observable of RemoteData<SignatureObject[]>
   */
  /*getSignatures(options: FindListOptions = {}): Observable<RemoteData<SignatureObject[]>> {
    return this.restService.getDataById(this.getSubmissionObjectLinkName(), submissionId).pipe(
      find((submissionObjects: SubmissionObject[]) => isNotUndefined(submissionObjects)),
      map((submissionObjects: SubmissionObject[]) => createSuccessfulRemoteDataObject(
        submissionObjects[0])),
      catchError((errorResponse: ErrorResponse) => {
        return createFailedRemoteDataObject$(null,
          new RemoteDataError(errorResponse.statusCode, errorResponse.statusText, errorResponse.errorMessage)
        )
      })
    );
  }*/
}
