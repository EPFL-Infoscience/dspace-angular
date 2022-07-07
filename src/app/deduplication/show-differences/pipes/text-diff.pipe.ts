import { Pipe, PipeTransform } from '@angular/core';
import * as htmldiff from './../configs/htmldiff.js';

@Pipe({
  name: 'dsTextDiff',
})
export class TextDiffPipe implements PipeTransform {
  transform(value1: string, value2: string) {
    return htmldiff(value1, value2);
  }
}
