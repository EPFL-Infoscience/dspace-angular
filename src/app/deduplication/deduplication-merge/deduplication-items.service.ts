import { getRemoteDataPayload } from './../../core/shared/operators';
import { followLink } from './../../shared/utils/follow-link-config.model';
import { Item } from './../../core/shared/item.model';
import { ItemDataService } from './../../core/data/item-data.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class DeduplicationItemsService {
  constructor(
    private itemDataService: ItemDataService,
  ) { }

  public getItemData(itemId: string): Observable<Item> {
    return this.itemDataService.findById(itemId, true, true, followLink('bundles', {}, followLink('bitstreams'))).pipe(
      getRemoteDataPayload(),
    )
  }

}
