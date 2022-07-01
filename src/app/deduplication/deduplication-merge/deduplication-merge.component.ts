import { MetadataValue } from './../../core/shared/metadata.models';
import { Item } from './../../core/shared/item.model';
import { Observable } from 'rxjs/internal/Observable';
import { DeduplicationStateService } from './../deduplication-state.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeduplicationItemsService } from './deduplication-items.service';
import { map } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ds-deduplication-merge',
  templateUrl: './deduplication-merge.component.html',
  styleUrls: ['./deduplication-merge.component.scss'],
})
export class DeduplicationMergeComponent implements OnInit, OnDestroy {
  protected storedItemIds$: Observable<string[]>;

  public itemsToCompare: ItemData[] = [];

  public differencesArray: string[][] = [];

  public setId: string;

  constructor(
    private deduplicationStateService: DeduplicationStateService,
    private deduplicationItemsService: DeduplicationItemsService,
    private route: ActivatedRoute,
  ) {
    this.storedItemIds$ = this.deduplicationStateService.getItemsToCompare();
    this.getItemsData();
    // * setId: signature-id:set-checksum *
    this.setId = this.route.snapshot.params.setId;
  }

  ngOnInit(): void { }

  public getItemsData() {
    this.storedItemIds$.subscribe((itemIds: string[]) => {
      itemIds.forEach((itemId: string) => {
        const item$: Observable<Item> = this.deduplicationItemsService
          .getItemData(itemId)
          .pipe(
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

  merge() {
    // TODO: Implement logic
  }



  showDiff(keyvalue, asdf?) {
    for (let index = 0; index < this.itemsToCompare.length; index++) {
      const item = this.itemsToCompare[index].object$;

      item.subscribe((res: Item) => {
        res.metadata[keyvalue.key].forEach((metadataValue: MetadataValue) => {
          console.log(metadataValue, 'metadataValue');

        });
      });
    }
  }

  private generateIdColor(color: string) {
    let hash = 0;
    for (var i = 0; i < color.length; i++) {
      hash = color.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00f4f0af).toString(16).toUpperCase();
    return `#${'00000'.substring(0, 6 - c.length) + c}`;
  }

  ngOnDestroy(): void {
    // Remove the items from store
    this.deduplicationStateService.dispatchRemoveItemsToCompare();
  }
}

export interface ItemData {
  object$: Observable<Item>;
  color: string;
}
