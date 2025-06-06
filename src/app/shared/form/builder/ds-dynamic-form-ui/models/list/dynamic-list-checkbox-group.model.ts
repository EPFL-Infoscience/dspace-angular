import { Subject } from 'rxjs';
import {
  DynamicCheckboxGroupModel,
  DynamicFormControlLayout,
  DynamicFormControlRelation,
  DynamicFormGroupModelConfig,
  serializable
} from '@ng-dynamic-forms/core';

import { VocabularyEntry } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry.model';
import { VocabularyOptions } from '../../../../../../core/submission/vocabularies/models/vocabulary-options.model';
import { hasValue } from '../../../../../empty.util';

export interface DynamicListCheckboxGroupModelConfig extends DynamicFormGroupModelConfig {
  vocabularyOptions: VocabularyOptions;
  groupLength?: number;
  openType?: boolean;
  repeatable: boolean;
  value?: VocabularyEntry[];
  typeBindRelations?: DynamicFormControlRelation[];
  required: boolean;
  hint?: string;
}

export class DynamicListCheckboxGroupModel extends DynamicCheckboxGroupModel {

  @serializable() vocabularyOptions: VocabularyOptions;
  @serializable() repeatable: boolean;
  @serializable() groupLength: number;
  @serializable() _value: VocabularyEntry[];
  @serializable() typeBindRelations: DynamicFormControlRelation[];
  @serializable() required: boolean;
  @serializable() hint: string;
  @serializable() toggleSecurityVisibility = false;
  @serializable() openType: boolean;

  isListGroup = true;
  valueChanges: Subject<any>;

  constructor(config: DynamicListCheckboxGroupModelConfig, layout?: DynamicFormControlLayout) {
    super(config, layout);

    this.vocabularyOptions = config.vocabularyOptions;
    this.groupLength = config.groupLength || 5;
    this._value = [];
    this.repeatable = config.repeatable;
    this.required = config.required;
    this.hint = config.hint;
    this.openType = config.openType;

    this.valueChanges = new Subject<any>();
    this.valueChanges.subscribe((value: VocabularyEntry | VocabularyEntry[]) => this.value = value);
    this.valueChanges.next(config.value);
    this.typeBindRelations = config.typeBindRelations ? config.typeBindRelations : [];
  }

  get hasAuthority(): boolean {
    return this.vocabularyOptions && hasValue(this.vocabularyOptions.name);
  }

  get value() {
    return this._value;
  }

  set value(value: VocabularyEntry | VocabularyEntry[]) {
    if (value) {
      if (Array.isArray(value)) {
        this._value = value;
      } else {
        // _value is non-extendable so assign it a new array
        this._value = (this.value as VocabularyEntry[]).concat([value]);
      }
    }
  }
}
