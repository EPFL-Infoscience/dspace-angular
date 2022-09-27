import { isEqual } from 'lodash';
import { DSONameService } from './../../../core/breadcrumbs/dso-name.service';
import { PaginatedList } from './../../../core/data/paginated-list.model';
import { Bundle } from './../../../core/shared/bundle.model';
import {
  getPaginatedListPayload,
  getAllSucceededRemoteDataPayload
} from './../../../core/shared/operators';
import { Bitstream } from './../../../core/shared/bitstream.model';
import { Item } from './../../../core/shared/item.model';

import { Pipe, PipeTransform } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
  transform(item: Item): Observable<Observable<Bitstream[]>> {
    if (item && item.bundles) {
      return item.bundles.pipe(
        getAllSucceededRemoteDataPayload(),
        getPaginatedListPayload(),
        map((x: Bundle[]) =>
          x.filter((bundle) =>
            isEqual(this.dsoNameService.getName(bundle), 'ORIGINAL')
          )
        ),
        mergeMap((bundle: Bundle[]) => {
          if (bundle.length > 0) {
            return bundle.map((b: Bundle) => {
              return b.bitstreams.pipe(
                getAllSucceededRemoteDataPayload(),
                map((bitstreams: PaginatedList<Bitstream>) =>
                  bitstreams.page
                )
              );
            });
          }
          return [];
        })
      );
    }
  }
}
