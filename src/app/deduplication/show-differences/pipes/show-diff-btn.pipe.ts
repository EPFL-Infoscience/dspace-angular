import { isEqual } from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { ItemData } from '../../interfaces/deduplication-differences.models';

@Pipe({
  name: 'dsShowDiffBtn'
})
export class ShowDiffBtnPipe implements PipeTransform {

  transform(values: ItemData[]): boolean {

    if (isEqual(values.length, 0)) {
      return false;
    }

    // if all the item ids in the list are different or not
    return values.every(v => isEqual(v.id, values[0].id));
  }
}
