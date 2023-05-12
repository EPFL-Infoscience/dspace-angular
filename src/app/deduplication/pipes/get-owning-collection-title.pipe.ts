import { Item } from '../../core/shared/item.model';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { getFirstSucceededRemoteDataPayload } from '../../core/shared/operators';
import { hasValue } from '../../shared/empty.util';
import { Collection } from '../../core/shared/collection.model';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'dsGetOwningCollectionTitle',
})
export class GetOwningCollectionTitlePipe implements PipeTransform {
  /**
   * Returns the item's owning collection title or empty answer otherwise
   * @param item The item to be compared
   */
  transform(item: Item): Observable<string> {
    return item?.owningCollection.pipe(
      getFirstSucceededRemoteDataPayload(),
      map((res: Collection) => {
        if (hasValue(res)) {
          return res.metadata['dc.title']
            ? res.metadata['dc.title'][0].value
            : '-';
        }
        return '-';
      })
    );
  }
}
