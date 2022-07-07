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

  @Input() itemList: ItemsMetadataValues[];

  @Input() metadataKey: string;

  public objectMap: Map<number, ItemData[]> = new Map<number, ItemData[]>();

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    if (hasValue(this.itemList)) {
      this.itemList.map((item: ItemsMetadataValues) => {
        if (this.objectMap.has(item.value.place)) {
          this.objectMap
            .get(item.value.place)
            .push({ id: item.itemId, text: item.value.value, color: item.color });
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

export interface ItemData {
  id: string;
  text: string;
  color: string;
}

export interface ItemsMetadataValues {
  itemId: string;
  value: MetadataValue;
  color: string;
}
