import { Pipe, PipeTransform } from '@angular/core';
// eslint-disable-next-line import/no-namespace
import * as htmldiff from 'htmldiff/src/htmldiff.js';

@Pipe({
  name: 'dsTextDiff',
})
export class TextDiffPipe implements PipeTransform {
  /**
   * Compares the two given texts and returns the differences in HTML.
   * @param {string} value1 - initial value to compare
   * @param {string} value2 - second value to compare
   * @return {*} the text with differences (ins and del tags)
   */
  transform(value1: string, value2: string): string {
    return htmldiff(value1, value2);
  }
}
