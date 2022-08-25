import { Collection } from './../../core/shared/collection.model';
import { getFirstSucceededRemoteDataPayload } from './../../core/shared/operators';
import { Item } from './../../core/shared/item.model';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemData } from '../interfaces/deduplication-differences.models';
import { map } from 'rxjs/operators';
import { hasValue } from './../../shared/empty.util';
import { getEntityPageRoute, getItemPageRoute } from './../../item-page/item-page-routing-paths';

@Component({
  selector: 'ds-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.scss'],
})
export class ItemsTableComponent implements OnInit {
  @Input() itemsToCompare: ItemData[] = [];

  constructor() {}

  ngOnInit(): void {}

  /**
   * Returns the item's owning collection title or empty answer otherwise
   * @param item The item to be compared
   */
  getOwningCollectionTitle(item: Item): Observable<string> {
    return item.owningCollection.pipe(
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

  getItemPage(item: Item): string {
    const type = item.firstMetadataValue('dspace.entity.type');
    return getEntityPageRoute(type, item.uuid);
  }
}
