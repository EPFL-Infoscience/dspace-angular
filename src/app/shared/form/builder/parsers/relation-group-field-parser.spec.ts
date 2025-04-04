import { FormFieldModel } from '../models/form-field.model';
import { RelationGroupFieldParser } from './relation-group-field-parser';
import { DynamicRelationGroupModel } from '../ds-dynamic-form-ui/models/relation-group/dynamic-relation-group.model';
import { FormFieldMetadataValueObject } from '../models/form-field-metadata-value.model';
import { ParserOptions } from './parser-options';
import { getMockTranslateService } from 'src/app/shared/mocks/translate.service.mock';

describe('RelationGroupFieldParser test suite', () => {
  let field: FormFieldModel;
  let inLineField: FormFieldModel;
  let initFormValues = {};
  let translateService = getMockTranslateService();

  const submissionId = '1234';
  const parserOptions: ParserOptions = {
    readOnly: false,
    submissionScope: 'testScopeUUID',
    collectionUUID: 'WORKSPACE',
    typeField: 'dc_type',
    isInnerForm: false
  };

  beforeEach(() => {
    field = {
      input: {
        type: 'group'
      },
      rows: [
        {
          fields: [
            {
              input: {
                type: 'onebox'
              },
              label: 'Author',
              mandatory: 'false',
              repeatable: false,
              hints: 'Enter the name of the author.',
              selectableMetadata: [
                {
                  metadata: 'author'
                }
              ],
              languageCodes: []
            },
            {
              input: {
                type: 'onebox'
              },
              label: 'Affiliation',
              mandatory: false,
              repeatable: true,
              hints: 'Enter the affiliation of the author.',
              selectableMetadata: [
                {
                  metadata: 'affiliation'
                }
              ],
              languageCodes: []
            }
          ]
        }
      ],
      label: 'Authors',
      mandatory: 'true',
      repeatable: false,
      mandatoryMessage: 'Entering at least the first author is mandatory.',
      hints: 'Enter the names of the authors of this item.',
      selectableMetadata: [
        {
          metadata: 'author'
        }
      ],
      languageCodes: []
    } as FormFieldModel;

  });

  afterEach(() => {
    field = null;
    inLineField = null;
  });

  it('should init parser properly', () => {
    const parser = new RelationGroupFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    expect(parser instanceof RelationGroupFieldParser).toBe(true);
  });

  it('should return a DynamicRelationGroupModel object', () => {
    const parser = new RelationGroupFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    const fieldModel = parser.parse();

    expect(fieldModel instanceof DynamicRelationGroupModel).toBe(true);
    expect(fieldModel.isInlineGroup).toBe(false);
  });

  it('should return a DynamicRelationGroupModel object when has a inline group', () => {
    inLineField = Object.assign({}, field);
    inLineField.input.type = 'inline-group';
    const parser = new RelationGroupFieldParser(submissionId, inLineField, initFormValues, parserOptions, null, translateService);

    const fieldModel = parser.parse();

    expect(fieldModel instanceof DynamicRelationGroupModel).toBe(true);
    expect(fieldModel.isInlineGroup).toBe(true);
  });

  it('should throw when rows configuration is empty', () => {
    field.rows = null;
    const parser = new RelationGroupFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    expect(() => parser.parse())
      .toThrow();
  });

  it('should set group init value properly', () => {
    initFormValues = {
      author: [new FormFieldMetadataValueObject('test author')],
      affiliation: [new FormFieldMetadataValueObject('test affiliation')]
    };
    const parser = new RelationGroupFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    const fieldModel = parser.parse();
    const expectedValue = [{
      author: new FormFieldMetadataValueObject('test author'),
      affiliation: new FormFieldMetadataValueObject('test affiliation')
    }];

    expect(fieldModel.value).toEqual(expectedValue);
  });

});
