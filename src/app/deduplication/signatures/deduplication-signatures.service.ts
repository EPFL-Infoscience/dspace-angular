import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { DeduplicationRestService } from '../../core/deduplication/deduplication-rest.service';
import { SortOptions, SortDirection } from '../../core/cache/models/sort-options.model';
import { FindListOptions } from '../../core/data/request.models';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list';
import { SignatureObject } from '../../core/deduplication/models/signature.model';
import { getFirstSucceededRemoteListPayload } from '../../core/shared/operators';
import { find, map } from 'rxjs/operators';
// TEST
import { of as observableOf } from 'rxjs';
import { PageInfo } from '../../core/shared/page-info.model';
import { createSuccessfulRemoteDataObject } from '../../shared/remote-data.utils';
import { ResourceType } from '../../core/shared/resource-type';
// END TEST

@Injectable()
export class DeduplicationSignaturesService {

  constructor(
    private deduplicationRestService: DeduplicationRestService
  ) {
  }

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
          // TEST
          const signatureObjectTitle: SignatureObject = {
            type: new ResourceType('signature'),
            id: 'title',
            signatureType: 'title',
            groupReviewerCheck: 20,
            groupSubmitterCheck: 35,
            groupAdminstratorCheck: 41,
            _links: {
              self: {
                href: 'http://rest.api/rest/api/deduplications/signatures/title'
              }
            }
          };

          const signatureObjectIdentifier: SignatureObject = {
            type: new ResourceType('signature'),
            id: 'identifier',
            signatureType: 'identifier',
            groupReviewerCheck: 12,
            groupSubmitterCheck: 71,
            groupAdminstratorCheck: 5,
            _links: {
              self: {
                href: 'http://rest.api/rest/api/deduplications/signatures/identifier'
              }
            }
          };

          const pageInfo = new PageInfo({
            elementsPerPage: 3,
            totalElements: 10,
            totalPages: 4,
            currentPage: 0
          });
          const array = [ signatureObjectTitle, signatureObjectIdentifier ];
          const paginatedList = new PaginatedList(pageInfo, array);
          return paginatedList;
          // END TEST
          // throwError(new Error('Can\'t retrieve signatures'));
        }
      })
    );
  }

}
