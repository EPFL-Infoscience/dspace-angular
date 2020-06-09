import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { find, map } from 'rxjs/operators';
import { DeduplicationRestService } from '../../core/deduplication/deduplication-rest.service';
import { SortOptions, SortDirection } from '../../core/cache/models/sort-options.model';
import { FindListOptions } from '../../core/data/request.models';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list';
import { SignatureObject } from '../../core/deduplication/models/signature.model';

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
   *
   * @param elementsPerPage
   *    The number of the signtures per page
   * @param currentPage
   *    The page number to retrieve
   * @return Observable<PaginatedList<SignatureObject>>
   *    The list of deduplication signatures.
   */
  public getSignatures(elementsPerPage, currentPage): Observable<PaginatedList<SignatureObject>> {
    const sortOptions = new SortOptions('signatureType', SortDirection.ASC);

    const findListOptions: FindListOptions = {
      elementsPerPage: elementsPerPage,
      currentPage: currentPage,
      sort: sortOptions
    };

    return this.deduplicationRestService.getSignatures(findListOptions).pipe(
      find((rd: RemoteData<PaginatedList<SignatureObject>>) => !rd.isResponsePending),
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
