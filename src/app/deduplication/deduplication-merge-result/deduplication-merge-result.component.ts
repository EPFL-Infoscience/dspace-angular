import { DeduplicationItemsService } from './../deduplication-merge/deduplication-items.service';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ItemData, MergeItems, MetadataMapObject } from '../interfaces/deduplication-merge.models';
import { isEqual } from 'lodash';
import { hasValue } from 'src/app/shared/empty.util';
import { Router } from '@angular/router';

@Component({
  selector: 'ds-deduplication-merge-result',
  templateUrl: './deduplication-merge-result.component.html',
  styleUrls: ['./deduplication-merge-result.component.scss']
})
export class DeduplicationMergeResultComponent implements OnInit {

  @Input() compareMetadataValues: Map<string, MetadataMapObject[]> = new Map();

  @Input() itemsToCompare: ItemData[];

  @Input() bitstreamList: string[] = [];

  @Input() itemsToMerge: MergeItems;

  @Input() targetItemId: string;

  constructor(public activeModal: NgbActiveModal,  private deduplicationItemsService: DeduplicationItemsService,
    private modalService: NgbModal,
    private router: Router,
    ) {}

  ngOnInit(): void {
  }

  onMerge(content) {
    this.modalService.open(content).dismissed.subscribe((result) => {
      if (isEqual(result, 'ok')) {
        console.log('before', this.itemsToMerge);
        this.itemsToMerge.bitstreams = this.bitstreamList;
        console.log('after' ,this.itemsToMerge);
        this.deduplicationItemsService
          .mergeData(this.itemsToMerge, this.targetItemId)
          .subscribe((res) => {
            if (hasValue(res)) {
              // this.router.navigate([
              //   'admin/deduplication/set',
              //   this.signatureId,
              // ]);
            }
          });
      }
    });
  }
}
