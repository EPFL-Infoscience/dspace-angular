import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { DeduplicationComponent } from './deduplication.component';

const MODULES = [
  CommonModule,
  SharedModule,
  CoreModule.forRoot(),
  // StoreModule.forFeature('deduplication', submissionReducers, storeModuleConfig as StoreConfig<SubmissionState, Action>),
];

const COMPONENTS = [
  DeduplicationComponent,
];

const DIRECTIVES = [
  // WorkpackageStatusDirective
];

const ENTRY_COMPONENTS = [];

const PROVIDERS = [];

@NgModule({
  imports: [
    ...MODULES
  ],
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...ENTRY_COMPONENTS
  ],
  providers: [
    ...PROVIDERS
  ],
  entryComponents: [
    ...ENTRY_COMPONENTS
  ],
  exports: [
    ...COMPONENTS,
    ...DIRECTIVES
  ]
})

/**
 * This module handles all components that are necessary for the deduplication process
 */
export class DedupicationModule {
}
