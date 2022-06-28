import { getRemoteDataPayload } from './../../core/shared/operators';
import { map, take } from 'rxjs/operators';
import { Item } from './../../core/shared/item.model';
import { RemoteData } from './../../core/data/remote-data';
import { ItemDataService } from './../../core/data/item-data.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class DeduplicationItemsService {

  constructor(private itemDataService: ItemDataService) { }

  public getItemData(itemId: string): Observable<Item> {
    return this.itemDataService.findById(itemId).pipe(
      getRemoteDataPayload()
    );
  }
}
