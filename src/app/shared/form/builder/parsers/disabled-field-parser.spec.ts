import { FormFieldModel } from '../models/form-field.model';
import { ParserOptions } from './parser-options';
import { DisabledFieldParser } from './disabled-field-parser';
import { DynamicDisabledModel } from '../ds-dynamic-form-ui/models/disabled/dynamic-disabled.model';
import { getMockTranslateService } from 'src/app/shared/mocks/translate.service.mock';

describe('DisabledFieldParser test suite', () => {
  let field: FormFieldModel;
  let initFormValues: any = {};
  let translateService = getMockTranslateService();

  const submissionId = '1234';
  const parserOptions: ParserOptions = {
    readOnly: false,
    submissionScope: null,
    collectionUUID: null,
    typeField: 'dc_type',
    isInnerForm: false
  };

  beforeEach(() => {
    field = {
      input: {
        type: ''
      },
      label: 'Description',
      mandatory: 'false',
      repeatable: false,
      hints: 'Enter a description.',
      selectableMetadata: [
        {
          metadata: 'description'
        }
      ],
      languageCodes: []
    } as FormFieldModel;

  });

  it('should init parser properly', () => {
    const parser = new DisabledFieldParser(submissionId, field, initFormValues, parserOptions, undefined, translateService);

    expect(parser instanceof DisabledFieldParser).toBe(true);
  });

  it('should return a DynamicDisabledModel object when repeatable option is false', () => {
    const parser = new DisabledFieldParser(submissionId, field, initFormValues, parserOptions, undefined, translateService);

    const fieldModel = parser.parse();

    expect(fieldModel instanceof DynamicDisabledModel).toBe(true);
  });

  it('should set init value properly', () => {
    initFormValues = {
      description: [
        'test description',
      ],
    };
    const expectedValue = 'test description';

    const parser = new DisabledFieldParser(submissionId, field, initFormValues, parserOptions, undefined, translateService);

    const fieldModel = parser.parse();
    expect(fieldModel.value.value).toEqual(expectedValue);
  });

});
