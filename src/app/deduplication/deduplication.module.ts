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
import { DeduplicationSetsService } from './sets/deduplication-sets.service';
import { DeduplicationSetsRestService } from '../core/deduplication/services/deduplication-sets-rest.service';
import { DeduplicationItemsService } from './deduplication-merge/deduplication-items.service';
import { ShowDifferencesComponent } from './show-differences/show-differences.component';
import { DeduplicationMergeRestService } from '../core/deduplication/services/deduplication-merge-rest.service';
import { DeduplicationMergeResultComponent } from './deduplication-merge-result/deduplication-merge-result.component';
import { SubmissionRepeatableFieldsRestService } from '../core/deduplication/services/submission-repeatable-fields-rest.service';
import { BitstreamTableComponent } from './bitstream-table/bitstream-table.component';
import { ItemsTableComponent } from './items-table/items-table.component';
import { CompareItemIdentifiersComponent } from './compare-item-identifiers/compare-item-identifiers.component';
import { DeduplicationSignaturesComponent } from './signatures/signature-component/deduplication-signatures.component';
import { GetBitstreamsPipe } from './pipes/ds-get-bitstreams.pipe';
import { GetOwningCollectionTitlePipe } from './pipes/get-owning-collection-title.pipe';
import { TextDiffPipe } from './pipes/text-diff.pipe';
import { ShowDiffBtnPipe } from './pipes/show-diff-btn.pipe';

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
  ShowDifferencesComponent,
  DeduplicationMergeResultComponent,
  BitstreamTableComponent,
  ItemsTableComponent,
  CompareItemIdentifiersComponent,
];

const PIPES = [
  TextDiffPipe,
  GetBitstreamsPipe,
  GetOwningCollectionTitlePipe,
  ShowDiffBtnPipe,
];

const DIRECTIVES = [];

const ENTRY_COMPONENTS = [];

const PROVIDERS = [
  DeduplicationStateService,
  DeduplicationSignaturesService,
  DeduplicationRestService,
  DeduplicationSetsService,
  DeduplicationSetsRestService,
  DeduplicationItemsService,
  DeduplicationMergeRestService,
  SubmissionRepeatableFieldsRestService
];

@NgModule({
  imports: [
    ...MODULES
  ],
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...ENTRY_COMPONENTS,
    ...PIPES,
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
