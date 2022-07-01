import { Bitstream } from './../../core/shared/bitstream.model';
import {
  getAllSucceededRemoteData,
  getRemoteDataPayload,
  getPaginatedListPayload,
} from './../../core/shared/operators';
import { Bundle } from './../../core/shared/bundle.model';
import { PaginatedList } from './../../core/data/paginated-list.model';
import { Item } from './../../core/shared/item.model';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map,  mergeMap } from 'rxjs/operators';

@Pipe({
  name: 'dsGetBundle',
})
export class DsGetBundlePipe implements PipeTransform {
  transform(object$: Observable<Item>): Observable<Observable<Bitstream[]>> {
    return object$.pipe(
      mergeMap((item: Item) => {
        if (item.bundles) {
          return item.bundles.pipe(
            getAllSucceededRemoteData(),
            getRemoteDataPayload(),
            getPaginatedListPayload(),
            map((x: Bundle[]) => {
              return x.filter((bundle) => bundle.name === 'ORIGINAL');
            }),
            mergeMap((bundle: Bundle[]) => {
              if (bundle.length > 0) {
                return bundle.map((b: Bundle) => {
                  return b.bitstreams.pipe(
                    getAllSucceededRemoteData(),
                    getRemoteDataPayload(),
                    map((bitstreams: PaginatedList<Bitstream>) => {
                      return bitstreams.page;
                    })
                  );
                });
              }
            })
          );
        }
      })
    );
  }
}
