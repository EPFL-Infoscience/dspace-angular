import { FormFieldModel } from '../models/form-field.model';
import { DropdownFieldParser } from './dropdown-field-parser';
import { DynamicScrollableDropdownModel } from '../ds-dynamic-form-ui/models/scrollable-dropdown/dynamic-scrollable-dropdown.model';
import { ParserOptions } from './parser-options';
import { getMockTranslateService } from 'src/app/shared/mocks/translate.service.mock';

describe('DropdownFieldParser test suite', () => {
  let field: FormFieldModel;
  let translateService = getMockTranslateService();

  const submissionId = '1234';
  const initFormValues = {};
  const parserOptions: ParserOptions = {
    readOnly: false,
    submissionScope: 'testScopeUUID',
    collectionUUID: null,
    typeField: 'dc_type',
    isInnerForm: false
  };

  beforeEach(() => {
    field = {
      input: {
        type: 'dropdown'
      },
      label: 'Type',
      mandatory: 'false',
      repeatable: false,
      hints: 'Select the tyupe.',
      selectableMetadata: [
        {
          metadata: 'type',
          controlledVocabulary: 'common_types_dataset',
          closed: false
        }
      ],
      languageCodes: []
    } as FormFieldModel;

  });

  it('should init parser properly', () => {
    const parser = new DropdownFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    expect(parser instanceof DropdownFieldParser).toBe(true);
  });

  it('should return a DynamicScrollableDropdownModel object when repeatable option is false', () => {
    const parser = new DropdownFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    const fieldModel = parser.parse();

    expect(fieldModel instanceof DynamicScrollableDropdownModel).toBe(true);
  });

  it('should throw when authority is not passed', () => {
    field.selectableMetadata[0].controlledVocabulary = null;
    const parser = new DropdownFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    expect(() => parser.parse())
      .toThrow();
  });

});
