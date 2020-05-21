import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';

import { StoreModule, Action, StoreConfig } from '@ngrx/store';
import { storeModuleConfig } from '../app.reducer';

@NgModule({
  imports: [
    CommonModule,
    CoreModule.forRoot(),
    SharedModule,
    // StoreModule.forFeature('deduplication', submissionReducers, storeModuleConfig as StoreConfig<SubmissionState, Action>),
    TranslateModule
  ],
  declarations: [

  ],
  entryComponents: [

  ],
  exports: [

  ],
  providers: [

  ]
})

/**
 * This module handles all components that are necessary for the deduplication process
 */
export class DedupicationModule {
}
