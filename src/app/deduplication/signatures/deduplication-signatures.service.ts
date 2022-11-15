import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeduplicationRestService } from '../../core/deduplication/services/deduplication-rest.service';
import { FindListOptions } from './../../core/data/find-list-options.model';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { SignatureObject } from '../../core/deduplication/models/signature.model';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';

/**
 * The service handling all deduplication requests to the REST service.
 */
@Injectable()
export class DeduplicationSignaturesService {

  /**
   * Initialize the service variables.
   * @param {DeduplicationRestService} deduplicationRestService
   */
  constructor(
    private deduplicationRestService: DeduplicationRestService
  ) { }

  /**
   * Return the list of deduplication signatures managing pagination and errors.
   * @return Observable<PaginatedList<SignatureObject>>
   *    The list of deduplication signatures.
   */
  public getSignatures(findListOptions: FindListOptions = {}): Observable<PaginatedList<SignatureObject>> {
    return this.deduplicationRestService.getSignatures(findListOptions).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<PaginatedList<SignatureObject>>) => {
        if (rd.hasSucceeded) {
          return rd.payload;
        } else {
          throw new Error('Can\'t retrieve signatures from deduplication REST service');
        }
      })
    );
  }
}
