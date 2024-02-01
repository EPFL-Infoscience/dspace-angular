import isEqual from 'lodash/isEqual';
import { Pipe, PipeTransform } from '@angular/core';
import { ItemData } from '../interfaces/deduplication-differences.models';

@Pipe({
  name: 'dsShowDiffBtn'
})
export class ShowDiffBtnPipe implements PipeTransform {

  /**
   * Returns a flag in order to determine whether to show or not the button
   * for the differences between the different values of different items
   * @param values Items participating in the merge
   * @returns a flag to show or not the 'show diff' button
   */
  transform(values: ItemData[]): boolean {

    if (isEqual(values.length, 0)) {
      return false;
    }

    // if all the item ids in the list are different or not
    return values.every(v => isEqual(v.id, values[0].id));
  }
}
