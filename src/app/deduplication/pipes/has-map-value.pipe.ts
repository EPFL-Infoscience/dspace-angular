import {
  Pipe,
  PipeTransform,
} from '@angular/core';


@Pipe({
  name: 'dsHasMapValue',
  pure: true
})
export class HasMapValuePipe implements PipeTransform {
  transform(map: Map<any, any>, key: string): boolean {
    return map.has(key);
  }
}
