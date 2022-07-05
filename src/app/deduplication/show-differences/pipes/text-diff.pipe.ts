import { Pipe, PipeTransform } from '@angular/core';
import * as diff from 'simple-text-diff';
const diffPatch = diff.default.diffPatch;

@Pipe({
  name: 'dsTextDiff'
})
export class TextDiffPipe implements PipeTransform {

  transform(value1: string, value2: string): unknown {
    const result1 = diffPatch(value1, value2);
    console.log(result1);

    return result1.after;
  }
}

