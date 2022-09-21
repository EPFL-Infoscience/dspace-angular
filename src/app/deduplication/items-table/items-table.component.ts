import { Collection } from './../../core/shared/collection.model';
import { getFirstSucceededRemoteDataPayload } from './../../core/shared/operators';
import { Item } from './../../core/shared/item.model';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemData } from '../interfaces/deduplication-differences.models';
import { map } from 'rxjs/operators';
import { hasValue } from './../../shared/empty.util';
import { getEntityPageRoute } from './../../item-page/item-page-routing-paths';

@Component({
  selector: 'ds-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.scss'],
})
export class ItemsTableComponent {

  @Input() itemsToCompare: ItemData[] = [];

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

  /**
   * Returns the path to navigate to item's details page.
   * @param item Dspace item
   */
  getItemPage(item: Item): string {
    const type = item.firstMetadataValue('dspace.entity.type');
    return getEntityPageRoute(type, item.uuid);
  }
}
