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
import { NgbAccordion, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Bitstream } from './../../core/shared/bitstream.model';
import {
  MetadataValue,
} from './../../core/shared/metadata.models';
import { Item } from './../../core/shared/item.model';
import { Observable } from 'rxjs/internal/Observable';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { DeduplicationItemsService } from './deduplication-items.service';
import { map, concatMap } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from '../../core/services/cookie.service';
import { forkJoin } from 'rxjs';
import { SubmissionRepeatableFieldsMock } from './submission-repeatable-fields.mock';

@Component({
  selector: 'ds-deduplication-merge',
  templateUrl: './deduplication-merge.component.html',
  styleUrls: ['./deduplication-merge.component.scss'],
  providers: [GetBitstreamsPipe],
})
export class DeduplicationMergeComponent implements OnInit, OnDestroy {
  /**
   * Accordions references in order to collapse/expand them on click
   * @type {QueryList<NgbAccordion>}
   */
  @ViewChildren(NgbAccordion) accordions: QueryList<NgbAccordion>;

  /**
   * Item ids from the cookie, selected from previous page to me compared
   * @type {string[]}
   */
  private storedItemIds: string[] = [];

  /**
   * The signature id of the items to compare
   * @type {string}
   */
  private signatureId: string;

  /**
   * The set-checksum of the set
   * @type {string}
   */
  private setChecksum: string;

  /**
   * The id of the first item to compare
   * It can be used as target item id for the merge
   * and can be sent as a parameter for the merge request
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
   * @type {ItemsMetadataField[]}
   */
  private mergedMetadataFields: ItemsMetadataField[] = [];

  /**
   * Stores the bitstream list of each item
   * for the bundle 'ORIGINAL'
   * @type {string[]}
   */
  public bitstreamList: string[] = [];

  /**
   * List of excluded metadata keys
   * retrieved from the REST configurations
   * @type {string[]}
   */
  private excludedMetadataKeys: string[] = [];

  /**
   * List of items' self links that are going to be compared
   * @type {string[]}
   */
  private mergedItems: string[] = [];

  /**
   * Reference to the modal instance
   * @type {NgbModalRef}
   */
  protected modalRef: NgbModalRef;

  /**
   * Stores the data of the item's metadata,based on the metadata keys.
   * @interface MetadataMapObject defines the structure of the neccessary data to show for the metadata values.
   * @type {Map<string, MetadataMapObject[]>}
   */
  public compareMetadataValues: Map<string, MetadataMapObject[]> = new Map();

  /**
   * Flag to control the accordion expansion
   * @type {boolean}
   */
  public isExpanded: boolean = true;

  /**
   * Stores the list of metadata fields (keys) that can accept multiple values
   * @type {string[]}
   */
  repeatableFields: string[] = [];

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
   * 1.Get item ids from the store.
   * 2.Set the target item id.
   * 3.Get the data for each item to compare, based on item id.
   * 4.Prepares the merge items links @var mergedItems for the merge request.
   * 5.Calculates the metadata fields to be merged, based on @var excludedMetadataKeys.
   * 6.Prepares the @var itemsToCompare for the template.
   * 7.Prepares the @var bitstreamList for the merge request.
   */
  private getItemsData() {
    if (this.storedItemIds.length > 0) {
      this.targetItemId = this.storedItemIds[0];
      // TODO: remove this when the backend is fixed
      this.repeatableFields = SubmissionRepeatableFieldsMock.repeatableFields;
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
              keysToInclude.map((key) => {
                this.calculateNewMetadataValues(item, key);
              })
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
          );
          this.itemsToCompare.push({
            object: item,
            color: color,
          });
          this.setColorPerItemInMetadataMap(item.id, color);
        });
        this.getItemBitstreams();
      });
      this.chd.detectChanges();
    } else {
      this.itemsToCompare = new Array<ItemData>();
    }
  }

  /**
   * Based on excluded metadata keys,
   * calculate the metadata fields to be rendered in the template.
   * @param item The item for which the metadata new structure is calculated
   * @param key The metadata field key
   */
  calculateNewMetadataValues(item: Item, key: string) {
    // get the object from metadata map that are going to be rendered in the template
    let mapObject: MetadataMapObject[] = this.compareMetadataValues.get(key);
    item.metadata[key].forEach((value: MetadataValue) => {
      if (this.compareMetadataValues.has(key)) {
        // if the key is already in the map, check if this value already exists in the map
        let object: MetadataMapObject = mapObject?.find((x) =>
          isEqual(x.value.toLowerCase(), value.value.toLowerCase())
        );
        if (hasValue(object)) {
          // if the value is already in the map, add the item data to the object,
          // for the same value (item) add the item id and link
          object.items.push({
            itemId: item.id,
            metadataPlace: value.place,
            color: '',
            _link: item._links.self.href,
          });
        } else {
          // if the value is not in the map, add new object to the map
          let newObject: MetadataMapObject = {
            value: value.value,
            items: [
              {
                itemId: item.id,
                metadataPlace: value.place,
                color: '',
                _link: item._links.self.href,
              },
            ],
          };
          // if the key is already in the map, add the new object to existing values,
          // otherwise add the new value metadata values array
          if (mapObject) {
            mapObject.push(newObject);
          } else {
            let existingValues = this.compareMetadataValues.get(key)
            existingValues.push(newObject);
          }
        }
      } else {
        // if the key is not in the map, add the key and value to the map
        let newObject: MetadataMapObject = {
          value: value.value,
          items: [
            {
              itemId: item.id,
              metadataPlace: value.place,
              color: '',
              _link: item._links.self.href,
            },
          ],
        };
        this.compareMetadataValues.set(key, [newObject]);
      }
      this.buildMergeObjectStructure(key, item._links.self.href, value.place, item.uuid);
    });
  }

  /**
   * Defines weather the given metadata field is repeatable or not,
   * based on the @var repeatableFields,which is retreated from the REST configuration.
   * @param key The metadata field key
   * @returns true if the key is found on @var repeatableFields list, false otherwise
   */
  hasMultipleSelection(key: string): boolean {
    if (this.repeatableFields.length > 0) {
      return this.repeatableFields.some((field) => isEqual(field, key));
    }
    return false;
  }

  /**
   * Returns weather the current selected values to be checked in the template.
   * @param key The metadata field key
   * @param items The items data for the given key
   * @returns true if the key is found on @var mergedMetadataFields list, false otherwise
   */
  isValueChecked(key: string, items: ItemContainer[]): boolean {
    if (this.mergedMetadataFields.findIndex(x => isEqual(x.metadataField, key)) > -1) {
      const objectList: ItemMetadataSource[] = this.mergedMetadataFields.find(x => isEqual(x.metadataField, key)).sources;
      const object: ItemMetadataSource = objectList.find(y => items?.some(i => isEqual(i._link, y.item) && isEqual(i.metadataPlace, y.place)));
      return hasValue(object);
    }
    return false;
  }


  merge() {
    let mergedItems: MergeItems = {
      setId: `${this.signatureId}:${this.setChecksum}`, //setId: signature-id:set-checksum
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
   * @param items The selected item's data
   * @param selectType The type of the selection (single or multiple)
   */
  onValueSelect(
    field: string,
    items: ItemContainer[],
    selectType: 'single' | 'multiple'
  ) {
    let metadataSourceIdx = -1;
    if (items.length > 0) {
      metadataSourceIdx = this.mergedMetadataFields
        .find((x) => isEqual(x.metadataField, field))
        .sources.findIndex((x) => items.find((y) => isEqual(y._link, x.item) && isEqual(y.metadataPlace, x.place)));
    }

    // 1.if the selection mode is 'single', remove the previous selection
    // 2.if the item is in the list, remove it.
    if (isEqual(selectType, 'single') || (isEqual(selectType, 'multiple') && metadataSourceIdx > -1)) {
      this.mergedMetadataFields
        .find((x) => isEqual(x.metadataField, field))
        .sources.splice(metadataSourceIdx, 1);
    }

    // if the item is not in the list, add it
    if (metadataSourceIdx < 0 || isEqual(selectType, 'single')) {
      let _link = '';
      let place = 0;

      if (isEqual(items.length, 1)) {
        _link = items[0]._link;
        place = items[0].metadataPlace;
      } else {
        let itemValue = items.find(x => isEqual(x.itemId, this.targetItemId));
        _link = itemValue ? itemValue._link : this.itemsToCompare.find(x => isEqual(x.object.id, this.targetItemId)).object._links.self.href;
        place = itemValue ? itemValue.metadataPlace : this.itemsToCompare.find(x => isEqual(x.object.id, this.targetItemId)).object.metadata[field][0].place;
      }

      this.mergedMetadataFields
        .find((x) => isEqual(x.metadataField, field))
        .sources.push({
          item: _link,
          place: place,
        });
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
   * Expands all the accordions in the template
   */
  public expandAll() {
    this.isExpanded = true;
    this.accordions.toArray().forEach(x => x.expandAll());
  }

  /**
   * Collapses all the accordions in the template
   */
  public collapseAll() {
    this.isExpanded = false;
    this.accordions.toArray().forEach(x => x.collapseAll());
  }

  /**
   * Builts the initial structure of @var mergedMetadataFields
   * with all metadata fields of the first item
   * and with source arrays.
   * Source arrays are built based on repeatable metadata fileds.
   * If the metadata field is not repeatable,
   * the source array will contain, as preselected, only the first element of target item.
   * @param metadataKey Meta data field key
   * @param itemLink The self link of the item to be merged
   * @param place Place of the metadata field, based on rest response
   */
  private buildMergeObjectStructure(metadataKey: string, itemLink: string, place: number, itemId: string) {
    if (!this.mergedMetadataFields.some(x => isEqual(x.metadataField, metadataKey)) && isEqual(this.targetItemId, itemId)) {
      // if the metadata field is not in the list, add it
      this.mergedMetadataFields.push({
        metadataField: metadataKey,
        sources: [{
          item: itemLink,
          place: place,
        }],
      });
    } else if (this.mergedMetadataFields.some(x => isEqual(x.metadataField, metadataKey)) && this.repeatableFields.some(x => isEqual(x, metadataKey))) {
      // if the metadata field is in the list, add the item to the source array
      this.mergedMetadataFields.find(x => isEqual(x.metadataField, metadataKey)).sources.push({
        item: itemLink,
        place: place,
      });
    }
  }

  /**
   * Defines the color for each item id in the metadata values,
   * in order to have the same color for each item id,
   * as the ones listed in the items table.
   * @param itemId The id of the item to be compared
   * @param color The pre-set color of the item
   */
  private setColorPerItemInMetadataMap(itemId: string, color: string) {
    this.compareMetadataValues.forEach((value) => {
      let metadataObject: MetadataMapObject[] = value.filter((x) =>
        x.items.find((y) => isEqual(y.itemId, itemId))
      );
      if (metadataObject.length > 0) {
        metadataObject.map((values) => {
          values.items.find((x) => isEqual(x.itemId, itemId)).color = color;
        });
      }
    });
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
  showDiff(key: string) {
    let valuesToCompare: ItemsMetadataValues[] = [];
    for (let index = 0; index < this.itemsToCompare.length; index++) {
      const item = this.itemsToCompare[index].object;
      const color = this.itemsToCompare[index].color;
      if (hasValue(item)) {
        item.metadata[key]?.forEach((metadataValue: MetadataValue) => {
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
    this.modalRef.componentInstance.metadataKey = key;
  }

  /**
   * Returns the item's owning collection title or empty answer otherwise
   * @param item The item to be compared
   */
  getOwningCollectionTitle(item: Item): Observable<string> {
    return item.owningCollection.pipe(
      getFirstSucceededRemoteDataPayload(),
      map((res: Collection) =>
        res.metadata['dc.title'] ? res.metadata['dc.title'][0].value : '-'
      )
    );
  }

  /**
   * Removes values from the list of items to be merged.
   * @param key The key of the metadata field
   */
  onDeleteAction(key: string) {
    if (this.mergedMetadataFields.findIndex(x => isEqual(x.metadataField, key)) > -1) {
      this.mergedMetadataFields.find(x => isEqual(x.metadataField, key)).sources = [];
    }
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
   * 1.Remove the items from cookies
   * 2.Close the modal ref
   */
  ngOnDestroy(): void {
    // Remove the items from cookies
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

/**
 * The interface used for the model of the metadata values
 */
export interface MetadataMapObject {
  value: string;
  items: ItemContainer[];
}

/**
 * The interface used for the model of the items to be merged
 */
export interface ItemContainer {
  itemId: string;
  metadataPlace: number;
  color: string;
  _link: string;
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
