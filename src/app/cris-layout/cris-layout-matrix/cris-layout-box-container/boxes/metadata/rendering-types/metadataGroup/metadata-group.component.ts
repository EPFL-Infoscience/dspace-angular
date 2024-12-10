import { RenderingTypeStructuredModelComponent } from '../rendering-type-structured.model';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../../core/shared/item.model';
import { TranslateService } from '@ngx-translate/core';
import { isNotEmpty } from '../../../../../../../shared/empty.util';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { BehaviorSubject } from 'rxjs';
import { LoadMoreService, NestedMetadataGroupEntry } from '../../../../../../services/load-more.service';

@Component({
  template: ''
})
export abstract class MetadataGroupComponent extends RenderingTypeStructuredModelComponent implements OnInit, OnDestroy {

  /**
   * This property is used to hold nested Layout Field inside a metadata group field
   */
  metadataGroup: LayoutField[] = [];

  /**
   * This property is used to hold a list of objects with nested Layout Field
   * and an index that shows the position of nested field inside metadata group field
   */
  componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();

  /**
   * The prefix used for box field label's i18n key
   */
  readonly fieldI18nPrefix = 'layout.field.label';

  /**
   * The prefix used for box field label's
   */
  readonly nestedMetadataPrefix = 'NESTED';

  /**
   * A boolean representing if component is initialized
   */
  initialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

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
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    @Inject('tabNameProvider') public tabNameProvider: string,
    protected translateService: TranslateService,
    protected loadMoreService: LoadMoreService,
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, tabNameProvider, translateService);
  }

  ngOnInit() {
    this.field.metadataGroup.elements.forEach((entry: LayoutField) => {
      if (this.item.metadata[entry.metadata]) {
        const styleValue = !entry.styleValue ? this.field.styleValue : (entry.styleValue + this.field.styleValue);
        this.metadataGroup.push(Object.assign({}, entry, { styleValue: styleValue }));
      }
    });
    this.metadataValues.forEach((mdv, index) => {
      this.metadataGroup.forEach(mdg => {
        const entry = {
          field: mdg,
          value: this.getMetadataValue(mdg, index)
        } as NestedMetadataGroupEntry;
        if (this.componentsToBeRenderedMap.has(index)) {
          const newEntries = [...this.componentsToBeRenderedMap.get(index), entry];
          this.componentsToBeRenderedMap.set(index, newEntries);
        } else {
          this.componentsToBeRenderedMap.set(index, [entry]);
        }
      });
    });

    this.initialized.next(true);
    this.setData('getComputedData');
  }

  /**
   * Set the limits of how many data loded from first and last
   */
   setData(functionName: string) {
    const {firstLimitedDataToBeRenderedMap, lastLimitedDataToBeRenderedMap, isConfigured, firstLimit, lastLimit} =
      functionName === 'getComputedData' ?
        this.loadMoreService.getComputedData(this.componentsToBeRenderedMap,this.field.rendering) :
        this.loadMoreService.fillAllData(this.componentsToBeRenderedMap,this.field.rendering);
    this.firstLimitedDataToBeRenderedMap = firstLimitedDataToBeRenderedMap;
    this.lastLimitedDataToBeRenderedMap = lastLimitedDataToBeRenderedMap;
    this.isConfigured = isConfigured;
    this.firstLimit = firstLimit;
    this.lastLimit = lastLimit;
}

  getMetadataValue(field: LayoutField, index: number): MetadataValue {
    const metadataList = this.item.findMetadataSortedByPlace(field.metadata);
    return isNotEmpty(metadataList[index]) ? metadataList[index] : null;
  }

  /**
   * Returns the translated label, if exists, otherwiuse returns a fallback value
   */
  getLabel(field: LayoutField): string {
    return this.getTranslationIfExists(`${this.fieldI18nPrefix}.${this.item.entityType}.${this.nestedMetadataPrefix}[${field.metadata}]`) ??
      this.getTranslationIfExists(`${this.fieldI18nPrefix}.${this.item.entityType}.[${field.metadata}]`) ??
      this.getTranslationIfExists(`${this.fieldI18nPrefix}.${this.item.entityType}.${field.metadata}`) ?? // old syntax - do not use
      this.getTranslationIfExists(`${this.fieldI18nPrefix}.[${field.metadata}]`) ??
      this.getTranslationIfExists(`${this.fieldI18nPrefix}.${field.label}`) ?? // old syntax - do not use
      field.label; // the untranslated value from the CRIS layout
  }

  /**
   * Return the translated label, if exists, otherwise returns null
   */
  getTranslationIfExists(key: string): string {
    const translation: string = this.translateService.instant(key);
    return translation !== key ? translation : null;
  }

  ngOnDestroy(): void {
    this.componentsToBeRenderedMap = null;
  }

}
