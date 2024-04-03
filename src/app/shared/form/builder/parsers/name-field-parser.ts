import { Inject } from '@angular/core';
import { FormFieldModel } from '../models/form-field.model';
import { ConcatFieldParser } from './concat-field-parser';
import {
  CONFIG_DATA,
  INIT_FORM_VALUES,
  PARSER_OPTIONS,
  SECURITY_CONFIG,
  SUBMISSION_ID,
  TRANSLATION_SERVICE
} from './field-parser';
import { ParserOptions } from './parser-options';
import {TranslateService} from '@ngx-translate/core';

export class NameFieldParser extends ConcatFieldParser {

  constructor(
    @Inject(SUBMISSION_ID) submissionId: string,
    @Inject(CONFIG_DATA) configData: FormFieldModel,
    @Inject(INIT_FORM_VALUES) initFormValues,
    @Inject(PARSER_OPTIONS) parserOptions: ParserOptions,
    @Inject(SECURITY_CONFIG) securityConfig: any = null,
    @Inject(TRANSLATION_SERVICE) translateService: TranslateService,
  ) {
    super(submissionId, configData, initFormValues, parserOptions, securityConfig, translateService,',', 'form.last-name', 'form.first-name');
  }
}
