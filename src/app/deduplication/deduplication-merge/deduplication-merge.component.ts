import { getRemoteDataPayload } from './../../core/shared/operators';
import { Item } from './../../core/shared/item.model';
import { Observable } from 'rxjs/internal/Observable';
import { DeduplicationStateService } from './../deduplication-state.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeduplicationItemsService } from './deduplication-items.service';
import { map } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';

@Component({
  selector: 'ds-deduplication-merge',
  templateUrl: './deduplication-merge.component.html',
  styleUrls: ['./deduplication-merge.component.scss'],
})
export class DeduplicationMergeComponent implements OnInit, OnDestroy {
  protected storedItemIds$: Observable<string[]>;

  public itemsToCompare: ItemData[] = [];

  constructor(
    private deduplicationStateService: DeduplicationStateService,
    private deduplicationItemsService: DeduplicationItemsService
  ) {
    this.storedItemIds$ = this.deduplicationStateService.getItemsToCompare();
    this.getItemsData();
  }

  ngOnInit(): void {
    // this.getItemsData();
  }

  public getItemsData() {
    this.storedItemIds$.subscribe((itemIds: string[]) => {
      itemIds.forEach((itemId: string) => {
        const item$: Observable<Item> = this.deduplicationItemsService
          .getItemData(itemId)
          .pipe(
            getRemoteDataPayload(),
            map((res: Item) => {
              if (hasValue(res)) {
                return res;
              }
            })
          );
        this.itemsToCompare.push({
          object$: item$,
          color: this.generateIdColor(
            this.itemsToCompare[this.itemsToCompare.length - 1]
              ? this.itemsToCompare[this.itemsToCompare.length - 1].color
              : 'ffffff'
          ),
        });
      });
    });
  }

  ngOnDestroy(): void {
    // Remove the items from store
    console.log(
      'Remove the items from store',
      new Date().getHours(),
      ': ',
      new Date().getMinutes()
    );
    this.deduplicationStateService.dispatchRemoveItemsToCompare();
  }

  private generateIdColor(color: string) {
    let hash = 0;
    for (var i = 0; i < color.length; i++) {
      hash = color.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00f5fcff).toString(16).toUpperCase();
    return `#${'00000'.substring(0, 6 - c.length) + c}`;
  }
}
export interface ItemData {
  object$: Observable<Item>;
  color: string;
}
