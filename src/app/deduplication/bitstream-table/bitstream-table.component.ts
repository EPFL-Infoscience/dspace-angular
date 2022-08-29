import { Component, Input, OnInit } from '@angular/core';
import { isEqual } from 'lodash';
import { Bitstream } from '../../core/shared/bitstream.model';
import { hasValue } from '../../shared/empty.util';
import { ItemData } from '../interfaces/deduplication-differences.models';

@Component({
  selector: 'ds-bitstream-table',
  templateUrl: './bitstream-table.component.html',
  styleUrls: ['./bitstream-table.component.scss']
})
export class BitstreamTableComponent implements OnInit {

  @Input() itemsToCompare: ItemData[];

  @Input() bitstreamList: string[] = [];

  constructor() {}

  ngOnInit(): void {}

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
