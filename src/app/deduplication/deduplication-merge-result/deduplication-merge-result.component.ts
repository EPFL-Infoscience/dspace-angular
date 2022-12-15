import { Item } from 'src/app/core/shared/item.model';
import { MergeItemsFromCompare } from './../interfaces/deduplication-merge.models';
import { DeduplicationStateService } from './../deduplication-state.service';
import { DeduplicationItemsService } from './../deduplication-merge/deduplication-items.service';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  ItemData,
  MergeSetItems,
  MetadataMapObject,
  SetIdentifiers,
} from '../interfaces/deduplication-merge.models';
import { isEqual } from 'lodash';
import { hasValue } from '../../shared/empty.util';

@Component({
  selector: 'ds-deduplication-merge-result',
  templateUrl: './deduplication-merge-result.component.html',
  styleUrls: ['./deduplication-merge-result.component.scss'],
})
export class DeduplicationMergeResultComponent {
  /**
   * Stores the final selections result, based on the metadata field key and corresponding values
   * @type {Map<string, MetadataMapObject[]>}
   */
  @Input() compareMetadataValues: Map<string, MetadataMapObject[]> = new Map();

  /**
   * Items included in the merge, in order to show their bitstreams
   * @type {ItemData[]}
   */
  @Input() itemsToCompare: ItemData[];

  /**
   * List of selected bitsreams (from bundle 'ORIGINAL')
   * @type {string[]}
   */
  @Input() bitstreamList: string[] = [];

  /**
   * The final object with all neccessary data to perform merge.
   * @type {MergeSetItems}
   */
  @Input() itemsToMerge: MergeSetItems | MergeItemsFromCompare;

  /**
   * The target item's UUID
   * @type {string}
   */
  @Input() targetItemId: string;

  /**
   * Set identifiers, in order to remove the merged set from store
   * @type {SetIdentifiers}
   */
  @Input() identifiers: SetIdentifiers | null;

  /**
   * Confirmation modal template ref
   */
  @ViewChild('content') confirmationModal: TemplateRef<any>;

  public modalRef: NgbModalRef;

  /**
   * Flag to show a progress while merge action is performed.
   */
  public isPending = false;

  constructor(
    public activeModal: NgbActiveModal,
    private deduplicationItemsService: DeduplicationItemsService,
    private deduplicationStateService: DeduplicationStateService,
    private modalService: NgbModal
  ) { }

  /**
   * On merge confirmation action perform merge
   * and remove the set from store if the returned status is successful
   * @param content confirmation modal
   */
  onMerge() {
  this.modalRef = this.modalService.open(this.confirmationModal);
    this.modalRef.dismissed.subscribe((result) => {
      if (isEqual(result, 'ok')) {
        this.isPending = true;
        this.itemsToMerge.bitstreams = this.bitstreamList;
        this.deduplicationItemsService
          .mergeData(this.itemsToMerge, this.targetItemId)
          .subscribe({
            next: (res) => {
              if (hasValue(res)) {
                this.activeModal.close();
                // remove the set from the store
                if (hasValue(this.identifiers)) {
                  this.deduplicationStateService.dispatchDeleteSet(
                    this.identifiers.signatureId,
                    this.identifiers.setId,
                    this.identifiers.rule
                  );
                }
              }
              this.isPending = false;
            },
            error: (err) => {
              // remove progress bar on fail
              this.isPending = false;
            }
          });
      }
    });
  }

    /**
   * Returns the first metadata value for the given metadata key.
   * @param item The item for which we are getting the value
   * @param key The key to get its value
   * @returns {string}
   */
     getFirstMetadtaValue(item: Item, key: string): string {
        if (hasValue(item) && hasValue(item.metadata)) {
          const date = item.firstMetadataValue(key);
          if (hasValue(date)) {
            return date;
          }
        }
      return '-';
    }
}
