import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../../core/shared/item.model';
import { CrisLayoutBox, LayoutField, LayoutFieldType } from '../../../../../../../core/layout/models/box.model';
import {
  FieldRenderingType,
  getMetadataBoxFieldRendering,
  MetadataBoxFieldRenderOptions
} from '../../rendering-types/metadata-box.decorator';
import { hasValue, isEmpty, isNotEmpty } from '../../../../../../../shared/empty.util';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../../../../environments/environment';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { Bitstream } from '../../../../../../../core/shared/bitstream.model';
import { getFirstCompletedRemoteData } from '../../../../../../../core/shared/operators';
import { map, take } from 'rxjs/operators';
import { BitstreamDataService } from '../../../../../../../core/data/bitstream-data.service';
import { RemoteData } from '../../../../../../../core/data/remote-data';
import { PaginatedList } from '../../../../../../../core/data/paginated-list.model';
import { Observable } from 'rxjs';
import { NestedMetadataGroupEntry } from '../../rendering-types/metadataGroup/metadata-group.component';
import { LoadMoreService } from 'src/app/cris-layout/services/load-more.service';

@Component({
  selector: 'ds-metadata-container',
  templateUrl: './metadata-container.component.html',
  styleUrls: ['./metadata-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataContainerComponent implements OnInit {
  /**
   * Current DSpace Item
   */
  @Input() item: Item;
  /**
   * Current layout box
   */
  @Input() box: CrisLayoutBox;
  /**
   * The metadata field to render
   */
  @Input() field: LayoutField;

  /**
   * The prefix used for box field label's i18n key
   */
  fieldI18nPrefix = 'layout.field.label.';

  /**
   * A boolean representing if metadata rendering type is structured or not
   */
  isStructured = false;

  /**
   * The configuration of the rendering component to render
   */
  metadataFieldRenderOptions: MetadataBoxFieldRenderOptions;

  /**
   * The rendering sub-type, if exists
   * e.g. for type identifier.doi this property
   * contains the sub-type doi
   */
  renderingSubType: string;

  /**
   * This property is used to hold nested Layout Field inside a metadata group field
   */
  metadataGroup: LayoutField[] = [];

  /**
   * This property is used to hold a list of objects with nested Layout Field and an index that shows the position of nested field inside metadata group field
   */
  componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();

  /**
   * This boolean is used to check a expand and collapse functionality is needed or not.
   */
  isLoadMore = false;

  /**
   * This property is used to hold first limited list of metadata objects
   */
   firstLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();

   /**
    * This property is used to hold last limited list of metadata objects
    */
   lastLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();

   /**
    * This property is used to hold a boolean which is used to identify .more or .last is configured or not
    */
    isConfigured: boolean;

   /**
    * This property is used to hold a number how many metadata objects should be loded form last
    */
    lastLimit: number;

    /**
     * This property is used to hold a number how many metadata object should be loded from first
     */
    firstLimit: number;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected translateService: TranslateService,
    protected cd: ChangeDetectorRef,
    public loadMoreService: LoadMoreService
  ) {
  }

  /**
   * Returns all metadata values in the item
   */
  get metadataValues(): MetadataValue[] {
    return this.field.metadata ? this.item.allMetadata(this.field.metadata) : [];
  }

  /**
   * Returns true if the field has label, false otherwise
   */
  get hasLabel(): boolean {
    return hasValue(this.field.label);
  }

  /**
   * Returns a string representing the label of field if exists
   */
  get label(): string {
    const fieldLabelI18nKey = this.fieldI18nPrefix + this.item.entityType + '.' + this.field.metadata;
    const header: string = this.translateService.instant(fieldLabelI18nKey);
    if (header === fieldLabelI18nKey) {
      // if translation does not exist return the value present in the header property
      return this.translateService.instant(this.field.label);
    } else {
      return header;
    }
  }

  /**
   * Returns a string representing the style of field container if exists
   */
  get containerStyle(): string {
    return this.field.style;
  }

  /**
   * Returns a string representing the style of field label if exists, default value otherwise
   */
  get labelStyle(): string {
    const defaultCol = environment.crisLayout.metadataBox.defaultMetadataLabelColStyle;
    return (isNotEmpty(this.field.styleLabel) && this.field.styleLabel.includes('col'))
      ? this.field.styleLabel : `${defaultCol} ${this.field.styleLabel}`;
  }

  ngOnInit() {
    const rendering = this.computeRendering(this.field);
    if (this.field.fieldType === LayoutFieldType.BITSTREAM && rendering.toLocaleLowerCase() === FieldRenderingType.ATTACHMENT.toLocaleLowerCase()) {
      this.hasBitstream().pipe(take(1)).subscribe((hasBitstream: boolean) => {
        if (hasBitstream) {
          this.initRenderOptions(rendering);
        }
      });
    } else if (this.hasFieldMetadataComponent(this.field)) {
      this.initRenderOptions(rendering);
    }
  }

  initRenderOptions(renderingType: string|FieldRenderingType): void {
    this.renderingSubType = this.computeSubType(this.field);
    this.metadataFieldRenderOptions = this.getMetadataBoxFieldRenderOptions(renderingType);
    this.isStructured = this.metadataFieldRenderOptions.structured;
    if (!this.isStructured && this.metadataValues.length > 1) {
      this.isLoadMore = true;
      this.setLoadMore();
    }
    this.cd.detectChanges();
  }

  hasBitstream(): Observable<boolean> {
    return this.bitstreamDataService.findAllByItemAndBundleName(this.item, this.field.bitstream.bundle)
      .pipe(
        getFirstCompletedRemoteData(),
        map((response: RemoteData<PaginatedList<Bitstream>>) => {
          return response.hasSucceeded && response.payload.page.length > 0;
        })
      );
  }

  hasFieldMetadataComponent(field: LayoutField) {
    // if it is metadatagroup and none of the nested metadatas has values then dont generate the component
    let existOneMetadataWithValue = false;
    if (field.fieldType === LayoutFieldType.METADATAGROUP) {
      field.metadataGroup.elements.forEach(el => {
        if (this.item.metadata[el.metadata]) {
          existOneMetadataWithValue = true;
        }
      });
    }
    return (this.field.fieldType === LayoutFieldType.BITSTREAM) ||
      (field.fieldType === LayoutFieldType.METADATAGROUP && existOneMetadataWithValue) ||
      (field.fieldType === LayoutFieldType.METADATA && this.item.firstMetadataValue(field.metadata));
  }

  computeSubType(field: LayoutField): string | FieldRenderingType {
    const rendering = field.rendering;
    let subtype: string;

    if (rendering?.indexOf('.') > -1) {
      const values = rendering.split('.');
      subtype = values[1];
    }
    return subtype;
  }

  computeRendering(field: LayoutField): string | FieldRenderingType {
    let rendering = hasValue(field.rendering) ? field.rendering : FieldRenderingType.TEXT;

    if (rendering.indexOf('.') > -1) {
      const values = rendering.split('.');
      rendering = values[0];
    }
    return rendering;
  }

  getMetadataBoxFieldRenderOptions(fieldRenderingType: string): MetadataBoxFieldRenderOptions {
    let renderOptions = getMetadataBoxFieldRendering(fieldRenderingType);
    // If the rendering type not exists will use TEXT type rendering
    if (isEmpty(renderOptions)) {
      renderOptions = getMetadataBoxFieldRendering(FieldRenderingType.TEXT);
    }
    return renderOptions;
  }

  trackUpdate(index, value: string) {
    return value;
  }


  getMetadataValue(field: LayoutField, index: number): MetadataValue {
    const metadataList = this.item.findMetadataSortedByPlace(field.metadata);
    return isNotEmpty(metadataList[index]) ? metadataList[index] : null;
  }

  setLoadMore(): void {
    this.metadataValues.forEach((metadataValue, index) => {
      const entry = {
        field:this.field ,
        value: this.getMetadataValue(this.field, index)
      } as NestedMetadataGroupEntry;
      if (this.componentsToBeRenderedMap.has(index)) {
        const newEntries = [...this.componentsToBeRenderedMap.get(index), entry];
        this.componentsToBeRenderedMap.set(index, newEntries);
      } else {
        this.componentsToBeRenderedMap.set(index, [entry]);
      }
    });
    this.setData('getComputedData');
  }
  

  /**
   * Set the limits of how many data loded from first and last
   */
  setData(functionName : string) {
      const {firstLimitedDataToBeRenderedMap, lastLimitedDataToBeRenderedMap, isConfigured, firstLimit, lastLimit} =  functionName === 'getComputedData'  ? this.loadMoreService.getComputedData(this.componentsToBeRenderedMap,this.field.rendering) : this.loadMoreService.fillAllData(this.componentsToBeRenderedMap,this.field.rendering);
      this.firstLimitedDataToBeRenderedMap = firstLimitedDataToBeRenderedMap;
      this.lastLimitedDataToBeRenderedMap = lastLimitedDataToBeRenderedMap;
      this.isConfigured = isConfigured;
      this.firstLimit = firstLimit;
      this.lastLimit = lastLimit;      
  }

}
