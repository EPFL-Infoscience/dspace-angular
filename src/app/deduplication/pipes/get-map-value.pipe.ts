import {
  Pipe,
  PipeTransform,
} from '@angular/core';


@Pipe({
  name: 'dsGetMapValue',
  pure: true
})
export class GetMapValuePipe implements PipeTransform {
  transform(map: Map<any, any>, key: string): string[] {
    return map.get(key);
  }
}
