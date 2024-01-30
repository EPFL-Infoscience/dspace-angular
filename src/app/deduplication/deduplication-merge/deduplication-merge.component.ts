import { MergeObject } from './../../core/deduplication/models/merge-object.model';
import { NestedMetadataObject, StoreIdentifiersToMerge } from './../interfaces/deduplication-merge.models';
import { isEqual } from 'lodash';
import { ConfigurationProperty } from './../../core/shared/configuration-property.model';
import { getFirstSucceededRemoteDataPayload } from './../../core/shared/operators';
import { ConfigurationDataService } from './../../core/data/configuration-data.service';
import { ShowDifferencesComponent } from './../show-differences/show-differences.component';
import { NgbAccordion, NgbModal, NgbModalOptions, NgbModalRef, } from '@ng-bootstrap/ng-bootstrap';
import { Bitstream } from './../../core/shared/bitstream.model';
import { MetadataValue } from './../../core/shared/metadata.models';
import { Item } from './../../core/shared/item.model';
import { Observable } from 'rxjs/internal/Observable';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren, } from '@angular/core';
import { DeduplicationItemsService } from './deduplication-items.service';
import { concatMap, debounceTime, finalize, map } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from '../../core/services/cookie.service';
import { forkJoin, fromEvent } from 'rxjs';
import {
  ItemContainer,
  ItemData,
  ItemMetadataSource,
  ItemsMetadataField,
  MetadataMapObject,
  SetIdentifiers,
} from '../interfaces/deduplication-merge.models';
import { ItemsMetadataValues } from '../interfaces/deduplication-differences.models';
import { DeduplicationMergeResultComponent } from '../deduplication-merge-result/deduplication-merge-result.component';
import { Location } from '@angular/common';
import { GetBitstreamsPipe } from '../pipes/ds-get-bitstreams.pipe';

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
   * Item ids/href-s from the cookies, selected from previous page to me compared
   * @type {string[]}
   */
  private storedItemList: string[] = [];

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
   * The set-rule
   * @type {string}
   */
  private setRule: string;

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

  public modalRef: NgbModalRef;
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
  public isExpanded = true;

  /**
   * Stores the list of metadata fields (keys) that can accept multiple values
   * @type {string[]}
   */
  public repeatableFields: string[] = [];

  /**
   * A flag to control if we are in the just compare mode or not
   */
  public justCompare = false;

  /**
   * Stores all the parent keys with their nested metadata fields
   * @type {Map<string, string[]>}
   */
  metadataKeysWithNestedFields: Map<string, string[]> = new Map();

  /**
   * Modal options configurations.
   * @private
   * @type {NgbModalOptions}
   */
  private modalConfigOptions: NgbModalOptions = {
    backdrop: 'static',
    centered: true,
    scrollable: true,
    size: 'xl',
  };

  /**
   *  The keys that depend on a parent key (the nested metadata).
   * @memberof DeduplicationMergeComponent
   */
  private nestedMetadataValues: string[] = [];

  /**
   * The default value when no value is selected for the nested metadata keys
   */
  public readonly noValuePlaceholder = '#PLACEHOLDER_PARENT_METADATA_VALUE#';

  showBtn$ = fromEvent(document, 'scroll').pipe(
    debounceTime(50),
    map(() => window.scrollY > 500)
  );

  constructor(
    private cookieService: CookieService,
    private deduplicationItemsService: DeduplicationItemsService,
    private getBitstreamsPipe: GetBitstreamsPipe,
    private modalService: NgbModal,
    private configurationDataService: ConfigurationDataService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private chd: ChangeDetectorRef
  ) {
    this.signatureId = this.route.snapshot.params.signatureId;
    this.setChecksum = this.route.snapshot.params.setChecksum;
    this.setRule = this.route.snapshot.queryParams.rule;
    this.justCompare = this.route.snapshot.queryParams.justCompare === 'true';

    if (hasValue(this.setChecksum)) {
      this.storedItemList = this.cookieService.get(
        `items-to-compare-${this.setChecksum}`
      );
    } else {

      const storeObj: StoreIdentifiersToMerge = this.cookieService.get(
        `items-to-compare-identifiersLinkList`
      );
      this.storedItemList = storeObj.identifiersLinkList;
      this.targetItemId = storeObj.targetItemUUID;
    }
  }

  ngOnInit(): void {
    this.getExcludedMetadata();
  }

  /**
   * Based on excluded metadata keys,
   * calculate the metadata fields to be rendered in the template.
   * @param item The item for which the metadata new structure is calculated
   * @param key The metadata field key
   */
  calculateNewMetadataValues(item: Item, key: string) {
    // get the object from metadata map that are going to be rendered in the template
    const mapObject: MetadataMapObject[] = this.compareMetadataValues.get(key);

    if (this.nestedMetadataValues.includes(key)) {
      // if the key is the nested field of a parent key Do Not show it separately
      return;
    }

    item.metadata[key].forEach((value: MetadataValue) => {
      if (this.compareMetadataValues.has(key)) {
        // if the key is already in the map, check if this value already exists in the map
        const object: MetadataMapObject = mapObject?.find((x) =>
          isEqual(x.value.toLowerCase(), value.value.toLowerCase())
        );

        if (hasValue(object)) {
          // if the value is already in the map, add the item data to the object,
          // for the same value (item) add the item id and link
          object.items.push({
            itemId: item.id,
            itemHandle: item.handle,
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
                itemHandle: item.handle,
                metadataPlace: value.place,
                color: '',
                _link: item._links.self.href,
              },
            ],
          };
          if (this.metadataKeysWithNestedFields.has(key)) {
            newObject.nestedMetadataValues = this.getNestedMetadataValuesByKey(this.metadataKeysWithNestedFields.get(key), item, value.place);
          }

          // if the key is already in the map, add the new object to existing values,
          // otherwise add the new value metadata values array
          if (mapObject) {
            mapObject.push(newObject);
          } else {
            const existingValues: MetadataMapObject[] = this.compareMetadataValues.get(key);
            if (existingValues.find(v => isEqual(v.value, newObject.value))) {
              // in cases when there is the same value for the same item
              existingValues.find(v => isEqual(v.value, newObject.value))?.items.concat(...newObject.items);
            } else {
              existingValues.push(newObject);
            }
          }
        }
      } else {
        // if the key is not in the map, add the key and value to the map
        const newObject: MetadataMapObject = {
          value: value.value,
          items: [
            {
              itemId: item.id,
              itemHandle: item.handle,
              metadataPlace: value.place,
              color: '',
              _link: item._links.self.href,
            },
          ],
        };
        if (this.metadataKeysWithNestedFields.has(key)) {
          newObject.nestedMetadataValues = this.getNestedMetadataValuesByKey(this.metadataKeysWithNestedFields.get(key), item, value.place);
        }

        this.compareMetadataValues.set(key, [newObject]);
      }
      this.buildMergeObjectStructure(
        key,
        item._links.self.href,
        value.place,
        item.uuid
      );
    });
  }

  /**
   * Gets the nested metadata values for a certain item based on the parent key
   * @param nestedKeys metadata key
   * @param item the item we are working with
   * @param metadataPlace place of metadata coming from rest
   * @returns the nested metadata values
   */
  private getNestedMetadataValuesByKey(nestedKeys: string[], item: Item, metadataPlace: number): NestedMetadataObject[] {
    // const nestedFields: MetadataValue[] = item.metadata[nestedKeys];
    const nestedMetadataValues: NestedMetadataObject[] = [];
    nestedKeys.forEach(key => {
      const nestedFields: MetadataValue[] = item.metadata[key];
      if (hasValue(nestedFields)) {
        // const nestedMetadataValues: NestedMetadataObject[] = [];
        nestedFields.forEach((metadata: MetadataValue) => {
          if (isEqual(metadata.place, metadataPlace) && !isEqual(metadata.value, this.noValuePlaceholder)) {
            const nestedMetadataValue: NestedMetadataObject = {
              value: metadata.value,
              nestedMetadataKey: key,
              items: [
                {
                  itemId: item.id,
                  itemHandle: item.handle,
                  metadataPlace: metadata.place,
                  color: '',
                  _link: item._links.self.href,
                },
              ],
            };
            nestedMetadataValues.push(nestedMetadataValue);
          }
        });
      }
    });
    return nestedMetadataValues;
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
    if (
      this.mergedMetadataFields.findIndex((x) =>
        isEqual(x.metadataField, key)
      ) > -1
    ) {
      const objectList: ItemMetadataSource[] = this.mergedMetadataFields.find(
        (x) => isEqual(x.metadataField, key)
      ).sources;
      const object: ItemMetadataSource = objectList.find((y) =>
        items?.some(
          (i) => isEqual(i._link, y.item) && isEqual(i.metadataPlace, y.place)
        )
      );
      return hasValue(object);
    }
    return false;
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
    const selectedMetadataField: ItemsMetadataField = this.mergedMetadataFields.find((x) => isEqual(x.metadataField, field));
    if (items.length > 0 && hasValue(selectedMetadataField?.sources)) {
      // find the index of the selected element for this metadata field
      metadataSourceIdx = selectedMetadataField.sources.findIndex((x) =>
        items.find(
          (y) => isEqual(y._link, x.item) && isEqual(y.metadataPlace, x.place)
        )
      );
    }
    // 1.if the selection mode is 'single', remove the previous selection
    // 2.if the item is in the list, remove it.
    if (
      isEqual(selectType, 'single') ||
      (isEqual(selectType, 'multiple') && metadataSourceIdx > -1)
    ) {
      selectedMetadataField?.sources.splice(metadataSourceIdx, 1);
    }
    // if the item is not in the list, add it
    if (metadataSourceIdx < 0 || isEqual(selectType, 'single')) {
      let _link = '';
      let place = 0;
      if (isEqual(items.length, 1)) {
        _link = items[0]._link;
        place = items[0].metadataPlace;
      } else {
        const targetItem = items.find((x) =>
          isEqual(x.itemId, this.targetItemId)
        );
        _link = targetItem
          ? targetItem._link
          : this.itemsToCompare.find((x) =>
            isEqual(x.object.id, this.targetItemId)
          ).object._links.self.href;
        place = targetItem
          ? targetItem.metadataPlace
          : this.itemsToCompare.find((x) =>
            isEqual(x.object.id, this.targetItemId)
          ).object.metadata[field][0].place;
      }
      if (hasValue(selectedMetadataField)) {
        selectedMetadataField.sources.push({
          item: _link,
          place: place,
        });
      } else {
        this.mergedMetadataFields.push({
          metadataField: field,
          sources: [
            {
              item: _link,
              place: place,
            },
          ],
        });
      }
    }
  }

  /**
   * In case of single selection, the selected item can be unselected and removed from the list.
   * @param field The metadata field to be merged
   * @param items The selected item's data
   * @param selectType The type of the selection (single or multiple)
   */
  uncheckValue(
    field: string,
    items: ItemContainer[],
    selectType: 'single' | 'multiple'
  ) {
    if (this.isValueChecked(field, items) && isEqual(selectType, 'single')) {
      const metadataSourceIdx = this.mergedMetadataFields
        .find((x) => isEqual(x.metadataField, field))
        .sources.findIndex((x) =>
          items.find(
            (y) => isEqual(y._link, x.item) && isEqual(y.metadataPlace, x.place)
          )
        );
      this.mergedMetadataFields
        .find((x) => isEqual(x.metadataField, field))
        .sources.splice(metadataSourceIdx, 1);
    }
  }

  /**
   * Expands all the accordions in the template
   */
  public expandAll() {
    this.isExpanded = true;
    this.accordions.toArray().forEach((x) => x.expandAll());
  }

  /**
   * Collapses all the accordions in the template
   */
  public collapseAll() {
    this.isExpanded = false;
    this.accordions.toArray().forEach((x) => x.collapseAll());
  }

  /**
   * Prepare the list of items show the difference between their values.
   * Opens the modal and passes the data.
   * @param keyvalue The keyvalue pair of the item's metadata
   */
  showDiff(key: string) {
    const valuesToCompare: ItemsMetadataValues[] = [];
    for (const itemToCompare of this.itemsToCompare) {
      if (hasValue(itemToCompare.object)) {
        itemToCompare.object.metadata[key]?.forEach((metadataValue: MetadataValue) => {
          valuesToCompare.push({
            itemId: itemToCompare.object.uuid,
            itemHandle: itemToCompare.object.handle,
            value: metadataValue,
            color: itemToCompare.color,
          });
        });
      }
    }

    this.modalRef = this.modalService.open(
      ShowDifferencesComponent,
      this.modalConfigOptions
    );
    this.modalRef.componentInstance.itemList = valuesToCompare;
    this.modalRef.componentInstance.metadataKey = key;
  }

  /**
   * Opens the modal with the result of the merge actions.
   * @var newMap stores all the selected values to be presented on the final version.
   */
  openFinalResultsModal(): void {
    this.modalRef = this.modalService.open(
      DeduplicationMergeResultComponent,
      this.modalConfigOptions
    );
    // keeping track of the selected values
    const newMap: Map<string, MetadataMapObject[]> = new Map();
    this.compareMetadataValues.forEach(
      (values: MetadataMapObject[], key: string) => {
        const selectedValues = values
          .map((value) => {
            if (this.isValueChecked(key, value.items)) {
              return value;
            }
          })
          .filter((x) => hasValue(x));
        newMap.set(key, selectedValues);
      }
    );
    // merge object
    let mergedItems: MergeObject = Object.assign(new MergeObject(),{
      bitstreams: [...this.bitstreamList],
      metadata: this.getMergedMetadataFields(newMap),
      mergedItems: [...this.mergedItems],
    });

    let setIdentifiers: SetIdentifiers = null;

    if (hasValue(this.signatureId) && hasValue(this.setChecksum)) {
      // merge object coming from sets
      mergedItems.setId = `${this.signatureId}:${this.setChecksum}`;
      setIdentifiers = {
        setId: `${this.signatureId}:${this.setChecksum}`,
        signatureId: this.signatureId,
        rule: this.setRule
      };
    }
    // data to pass to modal instance
    this.modalRef.componentInstance.compareMetadataValues = newMap;
    this.modalRef.componentInstance.itemsToCompare = this.itemsToCompare;
    this.modalRef.componentInstance.bitstreamList = this.bitstreamList;
    this.modalRef.componentInstance.itemsToMerge = mergedItems;
    this.modalRef.componentInstance.targetItemId = this.targetItemId;
    this.modalRef.componentInstance.identifiers = setIdentifiers;
    this.modalRef.componentInstance.justCompare = this.justCompare;

    // on modal close redirect to previous page
    this.modalRef.closed.subscribe((res) => {
      if (hasValue(this.signatureId) && this.setRule) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.router.navigate(['/admin/deduplication/set', this.signatureId, this.setRule]);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.router.navigate(['/admin/deduplication']);
      }
    });
  }

  /**
   * Prepares the metadata structure for the merge object, after all the selections or changes that may
   * have ocurred
   * @param compareMetadataValues The map that stores the metadata key and the selected values for each key
   * @returns {ItemsMetadataField[]} the list with keys and the calculated sources for each metadata key
   */
  private getMergedMetadataFields(compareMetadataValues: Map<string, MetadataMapObject[]>): ItemsMetadataField[] {
    compareMetadataValues.forEach((metadataMapObj: MetadataMapObject[], key: string) => {
      // if the item's value is not (auto)selected, we add the metadata key for the merge object with empty sources
      if (!this.mergedMetadataFields.some(x => isEqual(x.metadataField, key)) && isEqual(metadataMapObj.length, 0)) {
        this.mergedMetadataFields.push({
          metadataField: key,
          sources: [],
        });
      }

      // If the key we are working with is part of "nested" metadata,
      // we make sure to add this  "nested" metadata keys in the list,
      // so they can be sent with the object that is going to be merged.
      // If the key we are working with has selected values,
      // then we select the right value for the "nested" metadata keys,
      // based on their place, and prepare the source for the relevant key.
      if (this.metadataKeysWithNestedFields.has(key)) {
        const nestedMetadataKeys: string[] = this.metadataKeysWithNestedFields.get(key);
        if (isEqual(metadataMapObj.length, 0)) {
          nestedMetadataKeys.forEach((nestedKey: string) => {
            this.mergedMetadataFields.push({
              metadataField: nestedKey,
              sources: [],
            });
          });
        } else {
          const sources: ItemMetadataSource[] = [];
          metadataMapObj.forEach((value: MetadataMapObject) => {
            value.items.forEach((item: ItemContainer) => {
              sources.push({
                item: item._link,
                place: item.metadataPlace
              });
            });
          });

          const nestedObject: ItemsMetadataField = this.mergedMetadataFields.find(x => nestedMetadataKeys.some(nestedKey => isEqual(x.metadataField, nestedKey)));
          if (!hasValue(nestedObject)) {
            nestedMetadataKeys.forEach((nestedKey: string) => {
              this.mergedMetadataFields.push({
                metadataField: nestedKey,
                sources: [...sources],
              });
            });
          } else {
            nestedObject.sources = [...sources];
          }
        }
      }
    });
    return this.mergedMetadataFields;
  }

  /**
   * Removes values from the list of items to be merged.
   * @param key The key of the metadata field
   */
  removeAllSelections(key: string) {
    if (
      this.mergedMetadataFields.findIndex((x) =>
        isEqual(x.metadataField, key)
      ) > -1
    ) {
      this.mergedMetadataFields.find((x) =>
        isEqual(x.metadataField, key)
      ).sources = [];
    }
  }

  /**
   * Navigates to set list page @type {DeduplicationSetsComponent}
   */
  goBack() {
    this.location.back();
  }

  //#region Privates
  /**
   * Get excluded metadata keys from the REST configurations
   * and then get items with the corresponding metadata
   */
  private getExcludedMetadata() {
    this.configurationDataService
      .findByPropertyName('merge.excluded-metadata')
      .pipe(
        getFirstSucceededRemoteDataPayload(),
        finalize(() => this.getSubmissionFieldsPerTargetItem())
      ).subscribe({
        next: (res: ConfigurationProperty) => {
          if (hasValue(res)) {
            this.excludedMetadataKeys = [...res.values];
          }
        }
      });
  }

  /**
   * Get submission fields(repeatable & nested fields) for TARGET ITEM
   * in order to display data accurately in the template,
   * with multi/single-selection or with nested metadata on it
   */
  private getSubmissionFieldsPerTargetItem() {
    if (this.storedItemList?.length > 0) {
      // TARGET ITEM - FIRST ITEM
      this.targetItemId = this.targetItemId ?? this.storedItemList[0];
      this.deduplicationItemsService.getSubmissionFields(this.targetItemId).pipe(
        finalize(() => this.getItemsData()),
      ).subscribe((res) => {
        if (hasValue(res)) {
          const nestedFields: Map<string, string[]> = new Map(Object.entries(res.nestedFields));
          this.nestedMetadataValues = [].concat(...nestedFields.values());
          this.metadataKeysWithNestedFields = nestedFields;
          this.repeatableFields = [...res.repeatableFields];
        }
      });
    } else {
      this.itemsToCompare = new Array<ItemData>();
    }
  }

  /**
  * 1.Get item ids from the store.
  * 2.Set the target item id.
  * 3.Get the data for each item to compare, based on item id.
  * 4.Prepares the merge items links @var mergedItems for the merge request.
  * 5.Calculates the metadata fields to be merged, based on @var excludedMetadataKeys.
  * 6.Prepares the @var itemsToCompare for the template.
  * 7.Prepares the @var bitstreamList for the merge request.
  * 8.Get repeatable fields, so items can be multiselected
  * 9.Set the color for each item
  */
  private getItemsData() {
    const itemCalls: Observable<Item>[] = [];
    this.storedItemList.forEach((element: string) => {
          // element: uuid | href
      const call = this.getData(element).pipe(
        map((item: Item) => {
          if (hasValue(item)) {
            // if item link is not in the list, add it
            // DO NOT add the target item link
            if (!this.mergedItems.includes(item._links.self.href) && !isEqual(item.uuid, this.targetItemId)) {
              this.mergedItems.push(item._links.self.href);
            }
            const keys: string[] = Object.keys(item.metadata);
            // get only the metadata keys that are not excluded
            const keysToInclude = keys.filter(
              (k) => !this.excludedMetadataKeys.includes(k)
            );
            // calculate MetadataMap for each item based on the keys to be included
            keysToInclude.map((key) => {
              this.calculateNewMetadataValues(item, key);
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
        );
        this.itemsToCompare.push({
          object: item,
          color: color,
        });
        this.setColorPerItemInMetadataMap(item.id, color);
      });
      this.getItemBitstreams();
      this.chd.detectChanges();
    });
  }

  /**
   * Get item's data based on the element we have
   * @param element itemm uuid | item self-link
   * @returns {Observable<Item>} the item
   */
  getData(element: string): Observable<Item> {
    if (hasValue(this.setChecksum) && hasValue(this.signatureId)) {
      return this.deduplicationItemsService.getItemData(element);
    } else {
      return this.deduplicationItemsService.getItemByHref(element);
    }
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
  private buildMergeObjectStructure(
    metadataKey: string,
    itemLink: string,
    place: number,
    itemId: string
  ) {
    if (
      !this.mergedMetadataFields.some((x) =>
        isEqual(x.metadataField, metadataKey)
      ) &&
      isEqual(this.targetItemId, itemId)
    ) {
      // if the metadata field is not in the list,
      // add it with a selected default source (target item's data)
      this.mergedMetadataFields.push({
        metadataField: metadataKey,
        sources: [
          {
            item: itemLink,
            place: place,
          },
        ],
      });
    } else if (
      this.mergedMetadataFields.some((x) =>
        isEqual(x.metadataField, metadataKey)
      ) &&
      this.repeatableFields.some((x) => isEqual(x, metadataKey))
    ) {
      // if the metadata field is in the list, add the item to the source array
      this.mergedMetadataFields
        .find((x) => isEqual(x.metadataField, metadataKey))
        .sources.push({
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
      const metadataObject: MetadataMapObject[] = value.filter((x) =>
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
          .transform(item.object)?.pipe(
            concatMap((res$: Observable<Bitstream[]>) =>
              res$.pipe(map((bitstreams: Bitstream[]) => bitstreams))
            )
          )
          .subscribe((bitstreams: Bitstream[]) => {
            const linksPerItem = bitstreams.map((b) => b._links.self.href);
            linksPerItem.forEach((link) => {
              if (!this.bitstreamList.includes(link)) {
                this.bitstreamList.push(link);
              }
            });
          });
      });
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
    for (let i = 0; i < color.length; i++) {
      // eslint-disable-next-line no-bitwise
      hash = color.charCodeAt(i) + ((hash << 5) - hash);
    }
    // eslint-disable-next-line no-bitwise
    const c = (hash & 0x00f4f0af).toString(16).toUpperCase();
    return `#${'ff8080'.substring(0, 6 - c.length) + c}`;
  }
  //#endregion

  /**
   * 1.Remove the items from cookies
   * 2.Close the modal ref
   */
  ngOnDestroy(): void {
    // Remove the items from the cookies
    this.cookieService.remove(`items-to-compare-${this.setChecksum}`);
    this.cookieService.remove(`items-to-compare-identifiersLinkList`);
    this.modalRef?.close();
  }

  goToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
}
