import { Pipe, PipeTransform } from '@angular/core';
import { defaultIfEmpty, map } from 'rxjs/operators';
import { combineLatest, Observable, of, switchMap } from 'rxjs';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { Bitstream } from '../../core/shared/bitstream.model';
import { Bundle } from '../../core/shared/bundle.model';
import { Item } from '../../core/shared/item.model';
import { getAllSucceededRemoteDataPayload, getPaginatedListPayload } from '../../core/shared/operators';

@Pipe({
  name: 'dsGetBitstreams',
})
export class GetBitstreamsPipe implements PipeTransform {
  constructor(private dsoNameService: DSONameService) { }

  /**
   * Get the item object and returns the bitstreams
   * for the 'ORIGINAL' bundle
   * @param item Item object
   */
  transform(item: Item): Observable<Bitstream[]> {
    if (item && item.bundles) {
      return item.bundles.pipe(
        getAllSucceededRemoteDataPayload(),
        getPaginatedListPayload(),
        switchMap((bundle: Bundle[]) => {
          const originalBundle = bundle.filter(b => this.dsoNameService.getName(b) === 'ORIGINAL');
          if (originalBundle.length > 0) {
            const bitstreamObservables = originalBundle.map(b => {
              return b.bitstreams.pipe(
                getAllSucceededRemoteDataPayload(),
                map((bitstreams: PaginatedList<Bitstream>) =>
                  bitstreams.page
                ),
                defaultIfEmpty([])
              );
            });
            return combineLatest(bitstreamObservables).pipe(
              map(arraysOfBitstreams => arraysOfBitstreams.reduce((acc, val) => acc.concat(val), []))
            );
          }
          return [];
        })
      );
    }
    return of([]);
  }
}
