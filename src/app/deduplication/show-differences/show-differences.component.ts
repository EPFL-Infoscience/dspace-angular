import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MetadataValue } from './../../core/shared/metadata.models';
import { Component, Input, OnInit } from '@angular/core';
import { hasValue } from '../../shared/empty.util';

@Component({
  selector: 'ds-show-differences',
  templateUrl: './show-differences.component.html',
  styleUrls: ['./show-differences.component.scss'],
})
export class ShowDifferencesComponent implements OnInit {
  /**
   * The list of items with their metadata values
   * @type {ItemsMetadataValues[]}
   */
  @Input() itemList: ItemsMetadataValues[];

  /**
   * The key of metadata map
   * @type {string}
   */
  @Input() metadataKey: string;

  /**
   * The map of metadata values by item place
   * For each item place, there are metadata values,
   * of each item, to be compared
   * @type {Map<number, ItemData[]>}
   */
  public objectMap: Map<number, ItemData[]> = new Map<number, ItemData[]>();

  constructor(public activeModal: NgbActiveModal) {}

  /**
   * Initialize the object map
   */
  ngOnInit(): void {
    if (hasValue(this.itemList)) {
      this.itemList.map((item: ItemsMetadataValues) => {
        if (this.objectMap.has(item.value.place)) {
          this.objectMap
            .get(item.value.place)
            .push({
              id: item.itemId,
              text: item.value.value,
              color: item.color,
            });
        } else {
          this.objectMap.set(item.value.place, [
            {
              id: item.itemId,
              text: item.value.value,
              color: item.color,
            },
          ]);
        }
      });
    }
  }
}

/**
 * The model of the item data
 */
export interface ItemData {
  id: string;    // item id
  text: string;  // the text to compare
  color: string; // identifier color of the item
}

/**
 * The model of items' metadata values
 */
export interface ItemsMetadataValues {
  itemId: string;
  value: MetadataValue;
  color: string;
}
