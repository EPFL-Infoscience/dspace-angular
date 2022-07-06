import { ConfigurationProperty } from './../../core/shared/configuration-property.model';
import { getRemoteDataPayload } from './../../core/shared/operators';
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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeduplicationItemsService } from './deduplication-items.service';
import { map, concatMap, take } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';
import { ActivatedRoute } from '@angular/router';
import { DsGetBundlePipe } from './ds-get-bundle.pipe';

@Component({
  selector: 'ds-deduplication-merge',
  templateUrl: './deduplication-merge.component.html',
  styleUrls: ['./deduplication-merge.component.scss'],
  providers: [DsGetBundlePipe],
})
export class DeduplicationMergeComponent implements OnInit, OnDestroy {
  protected storedItemIds$: Observable<string[]>;

  protected setId: string;

  public itemsToCompare: ItemData[] = [];

  protected mergedMetadataFields: ItemsMetadataField[] = [];

  protected bitstreamList: string[] = [];

  protected excludedMetadataKeys: string[] = [];

  protected modalRef: NgbModalRef;

  constructor(
    private deduplicationStateService: DeduplicationStateService,
    private deduplicationItemsService: DeduplicationItemsService,
    private getBitstreamsPipe: DsGetBundlePipe,
    private modalService: NgbModal,
    private configurationDataService: ConfigurationDataService,
    private route: ActivatedRoute
  ) {
    this.storedItemIds$ = this.deduplicationStateService.getItemsToCompare();
    this.getExcludedMetadata();
    // * setId: signature-id:set-checksum *
    this.setId = this.route.snapshot.params.setId;
  }

  ngOnInit(): void {
    this.buildMergeObject();
    this.getItembitstreams();
  }

  private getExcludedMetadata() {
    this.configurationDataService
      .findByPropertyName('merge.excluded-metadata')
      .pipe(
        take(1),
        getRemoteDataPayload())
      .subscribe((res: ConfigurationProperty) => {
        if (hasValue(res)) {
          this.excludedMetadataKeys = [...res.values];
        }
        this.getItemsData();
      });
  }

  private getItemsData() {
    this.storedItemIds$.subscribe((itemIds: string[]) => {
      itemIds.forEach((itemId: string) => {
        const item$: Observable<Item> = this.deduplicationItemsService
          .getItemData(itemId)
          .pipe(
            take(1),
            map((item: Item) => {
              if (hasValue(item)) {
                let keys: string[] = Object.keys(item.metadata);
                // get only the metadata keys that are not excluded
                keys = keys.filter((key) => {
                  return !this.excludedMetadataKeys.includes(key);
                });
                // calculate MetadataMap for each item based on the keys to be included
                let dataToInclude: MetadataMap = new MetadataMap();
                let keyValuePair = Object.entries(item.metadata);
                keyValuePair.forEach(([key, value]) => {
                  if (keys.includes(key)) {
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
    });
  }

  merge() {
    // TODO: Implement logic
    let mergedItems: MergeItems = {
      setId: this.setId,
      bitstreams: this.bitstreamList,
      metadata: this.mergedMetadataFields,
    };

    console.log(mergedItems, 'mergedItems');
  }

  onValueSelect(
    field: string,
    itemLink: string,
    place: number,
    selectType: 'single' | 'multiple'
  ) {
    let metadataSourceIdx = this.mergedMetadataFields
      .find((x) => x.metadataField === field)
      .sources.findIndex((x) => x.item === itemLink);

    if (selectType === 'single' || metadataSourceIdx > -1) {
      // if the item is in the list, remove it.
      this.mergedMetadataFields
        .find((x) => x.metadataField === field)
        .sources.splice(metadataSourceIdx, 1);
    }

    // if the item is not in the list, add it
    if (metadataSourceIdx < 0) {
      this.mergedMetadataFields
        .find((x) => x.metadataField === field)
        .sources.push({
          item: itemLink,
          place: place,
        });
    }
  }

  private buildMergeObject() {
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

  private getItembitstreams() {
    this.itemsToCompare.map((item) => {
      this.getBitstreamsPipe
        .transform(item.object$)
        .pipe(
          concatMap((res$: Observable<Bitstream[]>) => {
            return res$.pipe(map((bitstreams: Bitstream[]) => bitstreams));
          })
        )
        .subscribe((bitstreams: Bitstream[]) => {
          let linksPerItem = bitstreams.map((b) => b._links.self.href);
          this.bitstreamList = this.bitstreamList.concat(...linksPerItem);
        });
    });
  }

  showDiff(keyvalue) {
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

  private generateIdColor(color: string) {
    let hash = 0;
    for (var i = 0; i < color.length; i++) {
      hash = color.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00f4f0af).toString(16).toUpperCase();
    return `#${'00000'.substring(0, 6 - c.length) + c}`;
  }

  ngOnDestroy(): void {
    // Remove the items from store
    this.deduplicationStateService.dispatchRemoveItemsToCompare();
    this.modalRef?.close();
  }
}

export interface ItemData {
  object$: Observable<Item>;
  color: string;
}

export interface MergeItems {
  setId: string;
  bitstreams: string[];
  metadata: ItemsMetadataField[];
}

export interface ItemsMetadataField {
  metadataField: string;
  sources: ItemMetadataSource[];
}

export interface ItemMetadataSource {
  item: string;
  place: number;
}
