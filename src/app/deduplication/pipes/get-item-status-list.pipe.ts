import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../../core/shared/item.model';

@Pipe({
  name: 'dsSetItemStatusList'
})
export class GetItemStatusListPipe implements PipeTransform {

  /**
   * Takes an item and returns all its statuses
   * @param item Item Object
   * @returns {string[]} the list of statuses per item
   */
  transform(item: Item): string[] {
    if (item) {
      const statusList = [];
      if (item.isDiscoverable) {
        statusList.push(ItemStatus.DISCOVERABLE.toString());
      }

      if (item.isWithdrawn) {
        statusList.push(ItemStatus.WITHDRAWN.toString());
      }

      if (item.isArchived) {
        statusList.push(ItemStatus.IN_ARCHIVE.toString());
      }

      return statusList;
    }
  }
}

/**
 * Status of an item
 */
export enum ItemStatus {
  DISCOVERABLE = 'DISCOVERABLE',
  WITHDRAWN = ' WITHDRAWN',
  IN_ARCHIVE = 'IN ARCHIVE'
}
