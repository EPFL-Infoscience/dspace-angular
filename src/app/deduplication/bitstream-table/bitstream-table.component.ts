import { Component, Input } from '@angular/core';
import { isEqual } from 'lodash';
import { Bitstream } from '../../core/shared/bitstream.model';
import { ItemData } from '../interfaces/deduplication-merge.models';

@Component({
  selector: 'ds-bitstream-table',
  templateUrl: './bitstream-table.component.html',
  styleUrls: ['./bitstream-table.component.scss'],
})
export class BitstreamTableComponent {
  /**
   * Items participating on the merge
   * @type {ItemData[]}
   */
  @Input() itemsToCompare: ItemData[];

  /**
   * List of selected bitstreams
   * @type {string[]}
   */
  @Input() bitstreamList: string[] = [];

  /**
   * Flag that indicates if we are on preview mode
   */
  @Input() previewMode = false;

  /**
   * Add/remove the bitstream from @var bitstreamList based on the selection
   * @param event The event that triggered the checkbox change
   * @param bitstream The bitstream to be checked or unchecked
   */
  onBitstreamChecked(event, bitstream: Bitstream) {
    const idx = this.bitstreamList.findIndex((link) =>
      isEqual(link, bitstream._links.self.href)
    );
    if (event.target.checked && idx < 0) {
      // if element is checked and not in the list, add it
      this.bitstreamList.push(bitstream._links.self.href);
    } else if (!event.target.checked && idx > -1) {
      // if element is unchecked, remove it from the list
      this.bitstreamList.splice(idx, 1);
    }
  }
}
