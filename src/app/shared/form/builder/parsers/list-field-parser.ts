import { FieldParser } from './field-parser';
import { isNotEmpty } from '../../../empty.util';
import { FormFieldMetadataValueObject } from '../models/form-field-metadata-value.model';
import { DynamicListCheckboxGroupModel } from '../ds-dynamic-form-ui/models/list/dynamic-list-checkbox-group.model';
import { DynamicListRadioGroupModel } from '../ds-dynamic-form-ui/models/list/dynamic-list-radio-group.model';
import { ParserType } from './parser-type';

export class ListFieldParser extends FieldParser {

  public modelFactory(fieldValue?: FormFieldMetadataValueObject | any, label?: boolean): any {
    const listModelConfig = this.initModel(null, label);
    listModelConfig.repeatable = this.configData.repeatable;
    if (this.configData.input.type === ParserType.OpenList) {
      listModelConfig.openType = true;
    } else {
      listModelConfig.openType = false;
    }

    if (this.configData.selectableMetadata[0].controlledVocabulary
      && this.configData.selectableMetadata[0].controlledVocabulary.length > 0) {

      if (isNotEmpty(this.getInitGroupValues())) {
        listModelConfig.value = [];
        this.getInitGroupValues().forEach((value: any) => {
          if (value instanceof FormFieldMetadataValueObject) {
            listModelConfig.value.push(value);
          } else {
            const valueObj = new FormFieldMetadataValueObject(value);
            listModelConfig.value.push(valueObj);
          }
        });
        if (!listModelConfig.repeatable) {
          listModelConfig.value = listModelConfig.value[0];
        }
      }
      this.setVocabularyOptions(listModelConfig, this.parserOptions.collectionUUID);
    }

    let listModel;
    if (listModelConfig.repeatable) {
      listModelConfig.group = [];
      listModel = new DynamicListCheckboxGroupModel(listModelConfig);
    } else {
      listModelConfig.options = [];
      listModel = new DynamicListRadioGroupModel(listModelConfig);
    }

    return listModel;
  }

}
