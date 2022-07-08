import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, Action, StoreConfig } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { storeModuleConfig } from '../app.reducer';
import { DeduplicationComponent } from './deduplication.component';
import { DeduplicationStateService } from './deduplication-state.service';
import { DeduplicationSignaturesService } from './signatures/deduplication-signatures.service';
import { DeduplicationState, deduplicationReducers } from './deduplication.reducer';
import { DeduplicationRestService } from '../core/deduplication/services/deduplication-rest.service';
import { deduplicationEffects } from './deduplication.effects';
import { DeduplicationSignaturesComponent } from './signatures/deduplication-signatures.component';
import { DeduplicationSetsService } from './sets/deduplication-sets.service';
import { DeduplicationSetsRestService } from '../core/deduplication/services/deduplication-sets-rest.service';
import { DeduplicationSetItemsRestService } from '../core/deduplication/services/deduplication-set-items-rest.service';
import { DeduplicationItemsService } from './deduplication-merge/deduplication-items.service';
import { ShowDifferencesComponent } from './show-differences/show-differences.component';
import { TextDiffPipe } from './show-differences/pipes/text-diff.pipe';
import { DeduplicationMergeRestService } from '../core/deduplication/services/deduplication-merge-rest.service';

const MODULES = [
  CommonModule,
  SharedModule,
  CoreModule.forRoot(),
  StoreModule.forFeature('deduplication', deduplicationReducers, storeModuleConfig as StoreConfig<DeduplicationState, Action>),
  EffectsModule.forFeature(deduplicationEffects),
];

const COMPONENTS = [
  DeduplicationComponent,
  DeduplicationSignaturesComponent,
  ShowDifferencesComponent
];

const PIPES = [
  TextDiffPipe
];

const DIRECTIVES = [];

const ENTRY_COMPONENTS = [];

const PROVIDERS = [
  DeduplicationStateService,
  DeduplicationSignaturesService,
  DeduplicationRestService,
  DeduplicationSetsService,
  DeduplicationSetsRestService,
  DeduplicationSetItemsRestService,
  DeduplicationItemsService,
  DeduplicationMergeRestService
];

@NgModule({
  imports: [
    ...MODULES
  ],
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...ENTRY_COMPONENTS,
    ...PIPES
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
