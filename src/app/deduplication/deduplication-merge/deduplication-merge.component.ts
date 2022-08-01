import { Collection } from './../../core/shared/collection.model';
import { isEqual } from 'lodash';
import { GetBitstreamsPipe } from './pipes/ds-get-bitstreams.pipe';
import { ConfigurationProperty } from './../../core/shared/configuration-property.model';
import { getFirstSucceededRemoteDataPayload } from './../../core/shared/operators';
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
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DeduplicationItemsService } from './deduplication-items.service';
import { map, concatMap } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue } from '@angular/common';
import { CookieService } from '../../core/services/cookie.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'ds-deduplication-merge',
  templateUrl: './deduplication-merge.component.html',
  styleUrls: ['./deduplication-merge.component.scss'],
  providers: [GetBitstreamsPipe],
})
export class DeduplicationMergeComponent implements OnInit, OnDestroy {
  private storedItemIds: string[] = [];

  /**
   * The composed signature id of the items to compare
   * @private
   * @type {string}
   */
  private signatureId: string;

  private setChecksum: string;

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
  public bitstreamList: string[] = [];

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

  public newCompareMetadataValues: Map<string, NewMetadataItemsObject[]> = new Map();

  constructor(
    private cookieService: CookieService,
    private deduplicationItemsService: DeduplicationItemsService,
    private getBitstreamsPipe: GetBitstreamsPipe,
    private modalService: NgbModal,
    private configurationDataService: ConfigurationDataService,
    private route: ActivatedRoute,
    private router: Router,
    private chd: ChangeDetectorRef
  ) {
    this.signatureId = this.route.snapshot.params.signatureId;
    this.setChecksum = this.route.snapshot.params.setChecksum;
    const itemIds = this.cookieService.get(
      `items-to-compare-${this.setChecksum}`
    );
    this.storedItemIds = itemIds ?? [];
  }

  ngOnInit(): void {
    this.getExcludedMetadata();
  }

  /**
   * Get excluded metadata keys from the REST configurations
   * and then get items with the corresponding metadata
   */
  private getExcludedMetadata() {
    this.configurationDataService
      .findByPropertyName('merge.excluded-metadata')
      .pipe(getFirstSucceededRemoteDataPayload())
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
    if (this.storedItemIds.length > 0) {
      this.targetItemId = this.storedItemIds[0];
      let itemCalls = [];
      this.storedItemIds.forEach((itemId: string) => {
        let call = this.deduplicationItemsService.getItemData(itemId).pipe(
          map((item: Item) => {
            if (hasValue(item)) {
              // if item link is not in the list, add it
              if (!this.mergedItems.includes(item._links.self.href)) {
                this.mergedItems.push(item._links.self.href);
              }
              let keys: string[] = Object.keys(item.metadata);
              // get only the metadata keys that are not excluded
              let keysToInclude = keys.filter(
                (k) => !this.excludedMetadataKeys.includes(k)
              );
              // calculate MetadataMap for each item based on the keys to be included
              let dataToInclude: MetadataMap = new MetadataMap();
              let keyValuePair = Object.entries(item.metadata);
              keyValuePair.forEach(([key, value]) => {
                if (keysToInclude.includes(key)) {
                  dataToInclude[key] = value;
                  this.calculateNewMetadataValues(item, key, value);
                }
              });

              item = Object.assign(new Item(), {
                ...item,
                metadata: dataToInclude,
              });

              return item;
            }
          })
        );

        itemCalls.push(call);
      });

      forkJoin(itemCalls).subscribe((items: Item[]) => {
        this.itemsToCompare = new Array<ItemData>();
        items.forEach((item: Item) => {
          const color = this.generateIdColor(
            this.itemsToCompare[this.itemsToCompare.length - 1]
              ? this.itemsToCompare[this.itemsToCompare.length - 1].color
              : 'ffffff'
          )
          this.itemsToCompare.push({
            object: item,
            color: color,
          });

          this.setColorPerItemInMetadataMap(item.id, color);
        });

        this.buildMergeObject();
        this.getItemBitstreams();

      });
      this.chd.detectChanges();
    } else {
      this.itemsToCompare = new Array<ItemData>();
    }
  }

  calculateNewMetadataValues(item: Item, key: string, values: MetadataValue[]) {
    let mapObject: NewMetadataItemsObject[] = this.newCompareMetadataValues.get(key);
    values.forEach((value: MetadataValue) => {
      if (this.newCompareMetadataValues.has(key)) {
        let object: NewMetadataItemsObject = mapObject?.find(x => isEqual(x.value.toLowerCase(), value.value.toLowerCase()));
        if (hasValue(object)) {
          object.items.push({
            itemId: item.id,
            metadataPlace: value.place,
            color: '',
            _link: item._links.self.href
          });
        } else {
          let newObject: NewMetadataItemsObject = {
            value: value.value,
            items: [{
              itemId: item.id,
              metadataPlace: value.place,
              color: '',
              _link: item._links.self.href
            }]
          }
          if (mapObject) {
            mapObject.push(newObject);
          } else {
            mapObject = new Array<NewMetadataItemsObject>(newObject);
          }
        }
      } else {
        let newObject: NewMetadataItemsObject = {
          value: value.value,
          items: [{
            itemId: item.id,
            metadataPlace: value.place,
            color: '',
            _link: item._links.self.href
          }]
        }

        this.newCompareMetadataValues.set(key, [newObject]);
      }
    });
    this.chd.detectChanges();
  }


  /**
   * setId: signature-id:set-checksum
   */
  merge() {
    let mergedItems: MergeItems = {
      setId: `${this.signatureId}:${this.setChecksum}`,
      bitstreams: [...this.bitstreamList],
      metadata: [...this.mergedMetadataFields],
      mergedItems: [...this.mergedItems],
    };

    this.deduplicationItemsService
      .mergeData(mergedItems, this.targetItemId)
      .subscribe((res) => {
        if (hasValue(res)) {
          this.router.navigate(['/deduplication/sets', this.signatureId]);
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
    place: number,
    items: NewItemContainer[],
    selectType: 'single' | 'multiple'
  ) {

    let metadataSourceIdx = -1;

    if (items.length > 0) {
      metadataSourceIdx = this.mergedMetadataFields
        .find((x) => x.metadataField === field)
        .sources.findIndex((x) => items.find(y => y._link === x.item));
    }

    // 1.if the selection mode is 'single', remove the previous selection
    // 2.if the item is in the list, remove it.
    if (selectType === 'single' || metadataSourceIdx > -1) {
      this.mergedMetadataFields
        .find((x) => isEqual(x.metadataField, field))
        .sources.splice(metadataSourceIdx, 1);
    }
    this.mergedMetadataFields[metadataSourceIdx].metadataField
    // if the item is not in the list, add it
    if (metadataSourceIdx < 0) {
      debugger;
      // this.mergedMetadataFields
      //   .find((x) => isEqual(x.metadataField, field))
      //   .sources.push({
      //     item: itemLink,
      //     place: place,
      //   });
    }
  }

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

  /**
   * Builts the initial structure of @var mergedMetadataFields
   * with all metadata fields of the first item
   * and with empty sources array
   */
  private buildMergeObject() {
    if (this.itemsToCompare && this.itemsToCompare.length > 0) {
      let keys = Object.keys(this.itemsToCompare[0].object.metadata);
      this.mergedMetadataFields = keys.map((key) => {
        return {
          metadataField: key,
          sources: [],
        };
      });
    }
  }

  setColorPerItemInMetadataMap(itemId: string, color: string) {
    this.newCompareMetadataValues.forEach((value, key) => {
      let metadataObject: NewMetadataItemsObject = value.find(x => x.items.find(y => y.itemId === itemId));
      if (hasValue(metadataObject)) {
        let value = metadataObject.items.find(y => y.itemId === itemId);
        value.color = color;
      }
    })
  }

  /**
   * Get the bitstreams of the selected items
   */
  private getItemBitstreams() {
    if (this.itemsToCompare && this.itemsToCompare.length > 0) {
      this.itemsToCompare.map((item) => {
        this.getBitstreamsPipe
          .transform(item.object)
          .pipe(
            concatMap((res$: Observable<Bitstream[]>) => {
              return res$.pipe(map((bitstreams: Bitstream[]) => bitstreams));
            })
          )
          .subscribe((bitstreams: Bitstream[]) => {
            const linksPerItem = bitstreams.map((b) => b._links.self.href);
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
      const item = this.itemsToCompare[index].object;
      const color = this.itemsToCompare[index].color;
      if (hasValue(item)) {
        item.metadata[keyvalue.key].forEach((metadataValue: MetadataValue) => {
          valuesToCompare.push({
            itemId: item.uuid,
            value: metadataValue,
            color: color,
          });
        });
      }
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

  getOwningCollectionTitle(item: Item): Observable<string> {
    return item.owningCollection.pipe(
      getFirstSucceededRemoteDataPayload(),
      map((res: Collection) =>
        res.metadata['dc.title'] ? res.metadata['dc.title'][0].value : '-'
      )
    );
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
   * 1.Remove the items from coocies
   * 2.Close the modal ref
   */
  ngOnDestroy(): void {
    // Remove the items from coocies
    this.cookieService.remove(`items-to-compare-${this.setChecksum}`);
    this.modalRef?.close();
  }
}

/**
 * The interface used for the model of the items data
 * and identifier color for the template
 */
export interface ItemData {
  object: Item;
  color: string;
}


export interface NewMetadataItemsObject {
  value: string;
  items: NewItemContainer[];
}

export interface NewItemContainer {
  itemId: string;
  metadataPlace: number;
  color: string;
  _link: string;
}

export interface CompareItemObject extends Item {
  color: string;
  // includedMetadata: MetadataMap;
}

export interface CompareItemMetadataValue {
  key: string;
  values: string[];
  itemIds: string[];
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
