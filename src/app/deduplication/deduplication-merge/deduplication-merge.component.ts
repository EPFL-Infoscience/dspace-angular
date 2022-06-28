import { Item } from './../../core/shared/item.model';

import { SetItemsObject } from './../../core/deduplication/models/set-items.model';
import { Observable } from 'rxjs/internal/Observable';
import { DeduplicationStateService } from './../deduplication-state.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { mergeMap, concat, concatMap, map } from 'rxjs/operators';
import { DeduplicationItemsService } from './deduplication-items.service';

@Component({
  selector: 'ds-deduplication-merge',
  templateUrl: './deduplication-merge.component.html',
  styleUrls: ['./deduplication-merge.component.scss'],
})
export class DeduplicationMergeComponent implements OnInit, OnDestroy {

  storedItems$: Observable<SetItemsObject[]>;
  itemsToCompare$: Observable<Item[]>;

  constructor(
    private deduplicationStateService: DeduplicationStateService,
    private deduplicationItemsService: DeduplicationItemsService,
  ) {
    this.storedItems$ = this.deduplicationStateService.getItemsToCompare();
    this.deduplicationItemsService.getItemData('53ed7a31-7581-41d4-84ec-99a61f3fa755').subscribe(res=>{
      console.log(res,'test');

    });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    // Remove the items from store
    console.log('Remove the items');
    this.deduplicationStateService.dispatchRemoveItemsToCompare();
  }
}
