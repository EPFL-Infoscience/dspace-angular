import { RemoteData } from './../../core/data/remote-data';
import { PaginatedList } from './../../core/data/paginated-list.model';
import { SortDirection } from './../../core/cache/models/sort-options.model';
import { FindListOptions } from './../../core/data/request.models';
import { SetObject } from './../../core/deduplication/models/set.model';
import { DeduplicationRestService } from './../../core/deduplication/deduplication-rest.service';
import { Injectable } from "@angular/core";
import { SortOptions } from './../../core/cache/models/sort-options.model';
import { Observable } from 'rxjs';
import { getFirstCompletedRemoteData } from './../../core/shared/operators';
import { map } from 'rxjs/operators';


@Injectable()
export class DeduplicationSignaturesService {

  constructor(private deduplicationRestService: DeduplicationRestService) {
  }

  public getSets(elementsPerPage, currentPage, signatureId): Observable<PaginatedList<SetObject>> {
    const sortOptions = new SortOptions('set' , SortDirection.ASC); //new SortOptions('signatureType', SortDirection.ASC);

    const findListOptions: FindListOptions = {
      elementsPerPage: elementsPerPage,
      currentPage: currentPage,
      sort: sortOptions
    };

    return this.deduplicationRestService.getSetsPerSignature(signatureId, findListOptions).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<PaginatedList<SetObject>>) => {
        if (rd.hasSucceeded) {
          return rd.payload;
        } else {
          throw new Error('Can\'t retrieve signatures from deduplication REST service');
        }
      })
    );
  }
}
