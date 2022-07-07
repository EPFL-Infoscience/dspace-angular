import { MergeObject } from './../../core/deduplication/models/merge-object.model';
import { take } from 'rxjs/operators';
import { MergeItems } from './deduplication-merge.component';
import { DeduplicationMergeRestService } from './../../core/deduplication/services/deduplication-merge-rest.service';
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
    private mergeService: DeduplicationMergeRestService,

  ) { }

  public getItemData(itemId: string): Observable<Item> {
    return this.itemDataService.findById(itemId, true, true, followLink('bundles', {}, followLink('bitstreams'))).pipe(
      getRemoteDataPayload(),
    )
  }

  public mergeData(data: MergeItems, targetItemId: string): Observable<MergeObject> {
    return this.mergeService.mergeItemsData(data, targetItemId)
    .pipe(
      take(1),
      getRemoteDataPayload()
    )
  }
}
