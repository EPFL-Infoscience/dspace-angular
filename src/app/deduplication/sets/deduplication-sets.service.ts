import { NoContent } from './../../core/shared/NoContent.model';
import { DeduplicationSetItemsRestService } from './../../core/deduplication/models/deduplication-set-items-rest.service';
import { SetItemsObject } from './../../core/deduplication/models/set-items.model';
import { RemoteData } from './../../core/data/remote-data';
import { PaginatedList } from './../../core/data/paginated-list.model';
import { FindListOptions } from './../../core/data/request.models';
import { SetObject } from './../../core/deduplication/models/set.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getFirstCompletedRemoteData } from './../../core/shared/operators';
import { catchError, map } from 'rxjs/operators';
import { DeduplicationSetsRestService } from './../../core/deduplication/models/deduplication-sets-rest.service';


@Injectable()
export class DeduplicationSetsService {
  constructor(
    private deduplicationRestService: DeduplicationSetsRestService,
    private deduplicationSetItemsRestService: DeduplicationSetItemsRestService
  ) {
  }

  /**
   * Returns the sets with the given signature id
   *
   * @param {number} elementsPerPage - the number of elements per page
   * @param {number} currentPage - the current page
   * @param {string} signatureId - the signature id
   * @param {string} [rule] - the rule of the submitter
   * @return {*}  {Observable<PaginatedList<SetObject>>}
   */
  public getSets(elementsPerPage: number, currentPage: number, signatureId: string, rule?: string): Observable<PaginatedList<SetObject>> {
    const findListOptions: FindListOptions = {
      elementsPerPage: elementsPerPage,
      currentPage: currentPage
    };

    return this.deduplicationRestService.getSetsPerSignature(findListOptions, signatureId, rule).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<PaginatedList<SetObject>>) => {
        if (rd.hasSucceeded) {
          return rd.payload;
        } else {
          throw new Error('Can\'t retrieve sets per signature from REST service');
        }
      })
    );
  }

  /**
   * Returns the set items with the given set id
   * @param {string} setId - the set id
   * @return {*}  {Observable<PaginatedList<SetItemsObject>>}
   */
  public getSetItems(setId: string): Observable<PaginatedList<SetItemsObject>> {
    const findListOptions: FindListOptions = {};
    return this.deduplicationSetItemsRestService.getItemsPerSet(findListOptions, setId).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<PaginatedList<SetItemsObject>>) => {
        if (rd.hasSucceeded) {
          return rd.payload;
        } else {
          throw new Error('Can\'t retrieve items per set from REST service');
        }
      })
    );
  }

  /**
   * Deletes the set with the given id
   * @param signatureId - the signature id of the set
   * @param checksum
   */
  public deleteSet(signatureId: string, checksum: string): Observable<RemoteData<NoContent>> {
    return this.deduplicationRestService.deleteSet(signatureId, checksum).pipe(
      catchError((error) => {
        throw new Error('Can\'t remove the set from REST service');
      })
    );
  }

  /**
   * Deletes the item with the given id
   * @param signatureId - the signature id of the set
   * @param itemId - the item id of the element to be removed
   */
  public deleteItem(signatureId: string, itemId: string, seChecksum: string): Observable<RemoteData<NoContent>> {
    return this.deduplicationSetItemsRestService.deleteItem(signatureId, itemId, seChecksum).pipe(
      catchError((error) => {
        throw new Error('Can\'t remove the set from REST service');
      })
    );
  }
}
