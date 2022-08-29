import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ItemData, MetadataMapObject } from '../interfaces/deduplication-merge.models';

@Component({
  selector: 'ds-deduplication-merge-result',
  templateUrl: './deduplication-merge-result.component.html',
  styleUrls: ['./deduplication-merge-result.component.scss']
})
export class DeduplicationMergeResultComponent implements OnInit {

  @Input() compareMetadataValues: Map<string, MetadataMapObject[]> = new Map();

  @Input() itemsToCompare: ItemData[];

  @Input() bitstreamList: string[] = [];

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
  }

}
