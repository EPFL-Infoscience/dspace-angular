import {
  DynamicFormControlLayout,
  DynamicFormControlRelation,
  DynamicRadioGroupModel,
  DynamicRadioGroupModelConfig,
  serializable
} from '@ng-dynamic-forms/core';
import { VocabularyOptions } from '../../../../../../core/submission/vocabularies/models/vocabulary-options.model';
import { hasValue } from '../../../../../empty.util';
import { VocabularyEntry } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry.model';

export interface DynamicListModelConfig extends DynamicRadioGroupModelConfig<any> {
  vocabularyOptions: VocabularyOptions;
  groupLength?: number;
  repeatable: boolean;
  value?: VocabularyEntry[];
  required: boolean;
  hint?: string;
  typeBindRelations?: DynamicFormControlRelation[];
  openType?: boolean;
}

export class DynamicListRadioGroupModel extends DynamicRadioGroupModel<any> {

  @serializable() vocabularyOptions: VocabularyOptions;
  @serializable() repeatable: boolean;
  @serializable() typeBindRelations: DynamicFormControlRelation[];
  @serializable() groupLength: number;
  @serializable() required: boolean;
  @serializable() hint: string;
  @serializable() openType: boolean;
  isListGroup = true;

  constructor(config: DynamicListModelConfig, layout?: DynamicFormControlLayout) {
    super(config, layout);

    this.vocabularyOptions = config.vocabularyOptions;
    this.groupLength = config.groupLength || 5;
    this.repeatable = config.repeatable;
    this.required = config.required;
    this.hint = config.hint;
    this.value = config.value;
    this.typeBindRelations = config.typeBindRelations ? config.typeBindRelations : [];
    this.openType = config.openType;
  }

  get hasAuthority(): boolean {
    return this.vocabularyOptions && hasValue(this.vocabularyOptions.name);
  }
}
