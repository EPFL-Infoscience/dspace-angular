import { Item } from './../../../core/shared/item.model';
import { getAllSucceededRemoteListPayload } from './../../../core/shared/operators';
import { Pipe, PipeTransform } from '@angular/core';
import { SetObject } from '../../../core/deduplication/models/set.model';
import { Observable } from 'rxjs';

@Pipe({
  name: 'dsGetItemsPerSet'
})
export class GetItemsPerSetPipe implements PipeTransform {

  transform(value: SetObject): Observable<Item[]> {
    const items = value.items.pipe(
      getAllSucceededRemoteListPayload()
    );

    return items;
  }
}
