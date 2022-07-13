import { isEqual } from 'lodash';
import { DSONameService } from './../../../core/breadcrumbs/dso-name.service';
import { PaginatedList } from './../../../core/data/paginated-list.model';
import { Bundle } from './../../../core/shared/bundle.model';
import {
  getAllSucceededRemoteData,
  getRemoteDataPayload,
  getPaginatedListPayload,
} from './../../../core/shared/operators';
import { Bitstream } from './../../../core/shared/bitstream.model';
import { Item } from './../../../core/shared/item.model';

import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Pipe({
  name: 'dsGetBitstreams',
})
export class GetBitstreamsPipe implements PipeTransform {
  constructor(private dsoNameService: DSONameService) { }

  /**
   * Get the item object and returns the bitstreams
   * for the 'ORIGINAL' bundle
   * @param object$ Observable of Item object
   */
  transform(object$: Observable<Item>): Observable<Observable<Bitstream[]>> {
    return object$.pipe(
      mergeMap((item: Item) => {
        if (item && item.bundles) {
          return item.bundles.pipe(
            getAllSucceededRemoteData(),
            getRemoteDataPayload(),
            getPaginatedListPayload(),
            map((x: Bundle[]) => {
              console.log(x);
              return x.filter((bundle) =>
                isEqual(this.dsoNameService.getName(bundle), 'ORIGINAL')
              );
            }),
            mergeMap((bundle: Bundle[]) => {
              if (bundle.length > 0) {
                return bundle.map((b: Bundle) => {
                  return b.bitstreams.pipe(
                    getAllSucceededRemoteData(),
                    getRemoteDataPayload(),
                    map((bitstreams: PaginatedList<Bitstream>) => {
                      console.log(bitstreams.page);

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
