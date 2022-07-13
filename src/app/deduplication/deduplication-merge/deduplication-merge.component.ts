import { Collection } from './../../core/shared/collection.model';
import { isEqual } from 'lodash';
import { GetBitstreamsPipe } from './pipes/ds-get-bundle.pipe';
import { ConfigurationProperty } from './../../core/shared/configuration-property.model';
import { getFirstSucceededRemoteData, getRemoteDataPayload, getFirstSucceededRemoteDataPayload } from './../../core/shared/operators';
import { ConfigurationDataService } from './../../core/data/configuration-data.service';
import {
  ItemsMetadataValues,
  ShowDifferencesComponent,
} from './../show-differences/show-differences.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Bitstream } from './../../core/shared/bitstream.model';
import {
  MetadataValue,
  MetadataMap,
} from './../../core/shared/metadata.models';
import { Item } from './../../core/shared/item.model';
import { Observable } from 'rxjs/internal/Observable';
import { DeduplicationStateService } from './../deduplication-state.service';
import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DeduplicationItemsService } from './deduplication-items.service';
import { map, concatMap, take, switchMap } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'ds-deduplication-merge',
  templateUrl: './deduplication-merge.component.html',
  styleUrls: ['./deduplication-merge.component.scss'],
  providers: [GetBitstreamsPipe],
})
export class DeduplicationMergeComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * Stores the item ids to compare
   * @private
   * @type {Observable<string[]>}
   */
  private storedItemIds$: Observable<string[]>;

  /**
   * The composed set id of the items to compare
   * setId: signature-id:set-checksum
   * @private
   * @type {string}
   */
  private setId: string;

  /**
   * The id of the first item to compare
   * It can be used as target item id for the merge
   * and can be sent as a parameter for the merge request
   * @private
   * @type {string}
   */
  private targetItemId: string;

  /**
   * Stores data for the retreaved items,
   * that are going to be compared among them.
   * Stores the data of the item and the generated color for each id,
   * in order to be identified between them.
   * @type {ItemData[]}
   */
  public itemsToCompare: ItemData[];

  /**
   * Stores all the metadata fields (keys, based on the first item)
   * and the sources of these metadata fields (selected values to be merged)
   * @private
   * @type {ItemsMetadataField[]}
   */
  private mergedMetadataFields: ItemsMetadataField[] = [];

  /**
   * Stores the bitstream list of each item
   * for the bundle 'ORIGINAL'
   * @private
   * @type {string[]}
   */
  private bitstreamList: string[] = [];

  /**
   * List of excluded metadata keys
   * retrieved from the REST configurations
   * @private
   * @type {string[]}
   */
  private excludedMetadataKeys: string[] = [];

  /**
   * List of items' self links that are going to be compared
   * @private
   * @type {string[]}
   */
  private mergedItems: string[] = [];

  /**
   * Reference to the modal instance
   * @protected
   * @type {NgbModalRef}
   */
  protected modalRef: NgbModalRef;

  constructor(
    private deduplicationStateService: DeduplicationStateService,
    private deduplicationItemsService: DeduplicationItemsService,
    private getBitstreamsPipe: GetBitstreamsPipe,
    private modalService: NgbModal,
    private configurationDataService: ConfigurationDataService,
    private route: ActivatedRoute,
    private router: Router,
    private chd: ChangeDetectorRef
  ) {
    this.storedItemIds$ = this.deduplicationStateService.getItemsToCompare();
    this.setId = this.route.snapshot.params.setId;

  }

  ngOnInit(): void {
    this.getExcludedMetadata();
  }

  ngAfterViewInit(): void {
    this.buildMergeObject();
    this.getItembitstreams();
  }

  /**
   * Get excluded metadata keys from the REST configurations
   */
  private getExcludedMetadata() {
    // console.log('merge.excluded-metadata');

    this.configurationDataService
      .findByPropertyName('merge.excluded-metadata')
      .pipe(
        getFirstSucceededRemoteData(),
        getRemoteDataPayload()
      )
      .subscribe((res: ConfigurationProperty) => {
        if (hasValue(res)) {
          this.excludedMetadataKeys = [...res.values];
        }
        this.getItemsData();
      });
  }

  /**
   * Get items ids from the store,
   * set the target item id,
   * and get the data for each item to compare, based on item id.
   * Prepares the merge items links @var mergedItems for the merge request.
   * Calculates the metadata fields to be merged, based on @var excludedMetadataKeys.
   * Prepares the @var itemsToCompare for the template.
   */
  private getItemsData() {
    this.storedItemIds$.subscribe((itemIds: string[]) => {
      if (itemIds.length > 0) {
        this.targetItemId = itemIds[0];
      }
      this.itemsToCompare = new Array<ItemData>();
      itemIds.forEach((itemId: string) => {
        const item$: Observable<Item> = this.deduplicationItemsService
          .getItemData(itemId)
          .pipe(
            take(1),
            map((item: Item) => {
              if (hasValue(item)) {
                // if item link is not in the list, add it
                if (!this.mergedItems.includes(item._links.self.href)) {
                  this.mergedItems.push(item._links.self.href);
                }

                let keys: string[] = Object.keys(item.metadata);
                // get only the metadata keys that are not excluded
                let keysToInclude = keys.filter(k => !this.excludedMetadataKeys.includes(k));
                // calculate MetadataMap for each item based on the keys to be included
                let dataToInclude: MetadataMap = new MetadataMap();
                let keyValuePair = Object.entries(item.metadata);
                keyValuePair.forEach(([key, value]) => {
                  if (keysToInclude.includes(key)) {
                    dataToInclude[key] = value;
                  }
                });

                item = Object.assign(new Item(), {
                  ...item,
                  metadata: dataToInclude
                });

                return item;
              }
            })
          );

        this.itemsToCompare.push({
          object$: item$,
          color: this.generateIdColor(
            this.itemsToCompare[this.itemsToCompare.length - 1]
              ? this.itemsToCompare[this.itemsToCompare.length - 1].color
              : 'ffffff'
          ),
        });
      });
      this.chd.detectChanges();
    });
  }

  merge() {
    let mergedItems: MergeItems = {
      setId: this.setId,
      bitstreams: [...this.bitstreamList],
      metadata: [...this.mergedMetadataFields],
      mergedItems: [...this.mergedItems]
    };

    // console.log(mergedItems, 'mergedItems');
    // debugger
    this.deduplicationItemsService.mergeData(mergedItems, this.targetItemId)
      .subscribe((res) => {
        if (hasValue(res)) {
          this.router.navigate(['/deduplication/sets', this.setId]);
        }
      });
  }

  /**
   * Calculates the @var mergedMetadataFields on value selection
   * @param field The metadata field to be merged
   * @param itemLink The self link of the selected item
   * @param place Place of the item
   * @param selectType The type of the selection (single or multiple)
   */
  onValueSelect(
    field: string,
    itemLink: string,
    place: number,
    selectType: 'single' | 'multiple'
  ) {
    let metadataSourceIdx = this.mergedMetadataFields
      .find((x) => x.metadataField === field)
      .sources.findIndex((x) => x.item === itemLink);

    // 1.if the selection mode is 'single', remove the previous selection
    // 2.if the item is in the list, remove it.
    if (selectType === 'single' || metadataSourceIdx > -1) {
      this.mergedMetadataFields
        .find((x) => isEqual(x.metadataField, field))
        .sources.splice(metadataSourceIdx, 1);
    }

    // if the item is not in the list, add it
    if (metadataSourceIdx < 0) {
      this.mergedMetadataFields
        .find((x) => isEqual(x.metadataField, field))
        .sources.push({
          item: itemLink,
          place: place,
        });
    }
  }

  /**
   * Builts the initial structure of @var mergedMetadataFields
   * with all metadata fields of the first item
   * and with empty sources array
   */
  private buildMergeObject() {
    if (this.itemsToCompare) {
      this.itemsToCompare[0]?.object$.subscribe((res: Item) => {
        if (res) {
          let keys = Object.keys(res.metadata);
          this.mergedMetadataFields = keys.map((key) => {
            return {
              metadataField: key,
              sources: [],
            };
          });
        }
      });

    }
  }

  /**
   * Get the bitstreams of the selected items
   */
  private getItembitstreams() {
    if (this.itemsToCompare) {
      this.itemsToCompare.map((item) => {
        this.getBitstreamsPipe
          .transform(item.object$)
          .pipe(
            concatMap((res$: Observable<Bitstream[]>) => {
              return res$.pipe(
                map((bitstreams: Bitstream[]) => bitstreams)
              );
            })
          )
          .subscribe((bitstreams: Bitstream[]) => {
            let linksPerItem = bitstreams.map((b) => b._links.self.href);
            this.bitstreamList = this.bitstreamList.concat(...linksPerItem);
          });
      });
    }
  }

  /**
   * Prepare the list of items show the difference between their values.
   * Opens the modal and passes the data.
   * @param keyvalue The keyvalue pair of the item's metadata
   */
  showDiff(keyvalue: KeyValue<string, MetadataValue>) {
    let valuesToCompare: ItemsMetadataValues[] = [];
    for (let index = 0; index < this.itemsToCompare.length; index++) {
      const item = this.itemsToCompare[index].object$;
      const color = this.itemsToCompare[index].color;
      item.subscribe((res: Item) => {
        if (hasValue(res)) {
          res.metadata[keyvalue.key].forEach((metadataValue: MetadataValue) => {
            valuesToCompare.push({
              itemId: res.uuid,
              value: metadataValue,
              color: color,
            });
          });
        }
      });
    }

    this.modalRef = this.modalService.open(ShowDifferencesComponent, {
      backdrop: 'static',
      centered: true,
      scrollable: true,
      size: 'lg',
    });
    this.modalRef.componentInstance.itemList = valuesToCompare;
    this.modalRef.componentInstance.metadataKey = keyvalue.key;
  }

  getOwningCollectionTitle(item$: Observable<Item>): Observable<string> {
    return item$.pipe(
      switchMap((res: Item) => {
        return res.owningCollection.pipe(
          getFirstSucceededRemoteDataPayload(),
          map((res: Collection) => res.metadata['dc.title'][0].value)
        )
      })
    )
  }

  /**
   * Generates randomly the same colors for each item,
   * starting from a given color and adding a random number to it,
   * based on previous used color @param color.
   * @param color The last used color,
   * in which is based the new generated color
   * @returns The new color for the next item
   */
  private generateIdColor(color: string) {
    let hash = 0;
    for (var i = 0; i < color.length; i++) {
      hash = color.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00f4f0af).toString(16).toUpperCase();
    return `#${'ff8080'.substring(0, 6 - c.length) + c}`;
  }

  /**
   * 1.Remove the items from the store
   * 2.Close the modal ref
   */
  ngOnDestroy(): void {
    // Remove the items from store
    this.deduplicationStateService.dispatchRemoveItemsToCompare();
    this.modalRef?.close();
  }
}

/**
 * The interface used for the model of the items data
 * and identifier color for the template
 */
export interface ItemData {
  object$: Observable<Item>;
  color: string;
}

/**
 * The interface used for the model of the merged metadata fields
 */
export interface MergeItems {
  setId: string;
  bitstreams: string[];
  mergedItems: string[];
  metadata: ItemsMetadataField[];
}

/**
 * The interface used for the model of the metadata fields
 */
export interface ItemsMetadataField {
  metadataField: string;
  sources: ItemMetadataSource[];
}

/**
 * The interface used for the model of the metadata sources
 */
export interface ItemMetadataSource {
  item: string;
  place: number;
}
