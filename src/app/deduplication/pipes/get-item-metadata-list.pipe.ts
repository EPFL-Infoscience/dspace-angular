import {
  Pipe,
  PipeTransform,
} from '@angular/core';

import {
  MetadataMap,
  MetadataValue,
} from '../../core/shared/metadata.models';
import { hasValue } from '../../shared/empty.util';

@Pipe({
  name: 'dsGetMetadataList',
  pure: true
})
export class GetItemMetadataListPipe implements PipeTransform {
  transform(metadata: MetadataMap, key: string): string[] {
    if (hasValue(metadata)) {
      const elements: MetadataValue[] = metadata[key];
      if (hasValue(elements)) {
        return elements.map((x) => x.value);
      }
    }
    return ['-'];
  }
}
