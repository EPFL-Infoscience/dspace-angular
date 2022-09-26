import { Item } from './../../core/shared/item.model';
import { Component, Input } from '@angular/core';
import { ItemData } from '../interfaces/deduplication-differences.models';
import { getEntityPageRoute } from './../../item-page/item-page-routing-paths';
import { GetOwningCollectionTitlePipe } from './get-owning-collection-title.pipe';

@Component({
  selector: 'ds-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.scss'],
  providers: [GetOwningCollectionTitlePipe],
})
export class ItemsTableComponent {
  @Input() itemsToCompare: ItemData[] = [];

  /**
   * Returns the path to navigate to item's details page.
   * @param item Dspace item
   */
  getItemPage(item: Item): string {
    const type = item?.firstMetadataValue('dspace.entity.type');
    return getEntityPageRoute(type, item?.uuid);
  }
}
