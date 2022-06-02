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
    private deduplicationRestService: DeduplicationSetsRestService) {
  }

  public getSets(elementsPerPage, currentPage, signatureId, rule?: string): Observable<PaginatedList<SetObject>> {
    // const sortOptions = new SortOptions('type' , SortDirection.ASC); //new SortOptions('signatureType', SortDirection.ASC);
    const findListOptions: FindListOptions = {
      elementsPerPage: elementsPerPage,
      currentPage: currentPage,
      // sort: sortOptions
    };

    return this.deduplicationRestService.getSetsPerSignature(findListOptions, signatureId, rule).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<PaginatedList<SetObject>>) => {
        if (rd.hasSucceeded) {
          console.log(rd.payload, 'rd.payload');
          return rd.payload;
        } else {
          throw new Error('Can\'t retrieve sets per signature from REST service');
        }
      })
    );
  }
}
