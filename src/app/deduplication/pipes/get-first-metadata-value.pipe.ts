import {
  Pipe,
  PipeTransform,
} from '@angular/core';

import { Item } from '../../core/shared/item.model';
import { hasValue } from '../../shared/empty.util';

@Pipe({
  name: 'dsGetFirstMetadataValue',
  pure: true
})
export class GetFirstMetadataValuePipe implements PipeTransform {
  transform(items: Item[], key: string): string {
    if (items?.length > 0) {
      const item = items[0];
      if (hasValue(item) && hasValue(item.metadata)) {
        const date = item.firstMetadataValue(key);
        if (hasValue(date)) {
          return date;
        }
      }
    }
    return '-';
  }
}
