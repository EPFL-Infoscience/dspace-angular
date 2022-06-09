import { NoContent } from './../../core/shared/NoContent.model';
import { DeduplicationSetItemsRestService } from './../../core/deduplication/models/deduplication-set-items-rest.service';
import { SetItemsObject } from './../../core/deduplication/models/set-items.model';
import { RemoteData } from './../../core/data/remote-data';
import { PaginatedList } from './../../core/data/paginated-list.model';
import { FindListOptions } from './../../core/data/request.models';
import { SetObject } from './../../core/deduplication/models/set.model';
import { Injectable } from "@angular/core";
import { SortOptions } from './../../core/cache/models/sort-options.model';
import { Observable, of } from 'rxjs';
import { getFirstCompletedRemoteData } from './../../core/shared/operators';
import { catchError, map, tap } from 'rxjs/operators';
import { DeduplicationSetsRestService } from './../../core/deduplication/models/deduplication-sets-rest.service';


@Injectable()
export class DeduplicationSetsService {
  constructor(
    private deduplicationRestService: DeduplicationSetsRestService,
    private deduplicationSetItemsRestService: DeduplicationSetItemsRestService
  ) {
  }

  public getSets(elementsPerPage: number, currentPage: number, signatureId: string, rule?: string): Observable<PaginatedList<SetObject>> {
    // const sortOptions = new SortOptions('type' , SortDirection.ASC);
    const findListOptions: FindListOptions = {
      elementsPerPage: elementsPerPage,
      currentPage: currentPage,
      // sort: sortOptions
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

  public getSetItems(setId: string): Observable<PaginatedList<SetItemsObject>> {
    // const sortOptions = new SortOptions('type' , SortDirection.ASC);
    const findListOptions: FindListOptions = {
      // sort: sortOptions
    };

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

  public deleteSet(signatureId: string): Observable<RemoteData<NoContent>> {
    return this.deduplicationRestService.deleteSet(signatureId).pipe(
      catchError((error) => {
        throw new Error('Can\'t remove the set from REST service');
      })
    );
  }

  public deleteItem(signatureId: string, itemId: string): Observable<RemoteData<NoContent>> {
    return this.deduplicationSetItemsRestService.deleteItem(signatureId, itemId).pipe(
      catchError((error) => {
        throw new Error('Can\'t remove the set from REST service');
      })
    );
  }
}
