import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { DeduplicationPageComponent } from './deduplication-page.component';
import { DeduplicationPageRoutingModule } from './deduplication-page.routing.module';
import { DedupicationModule } from '../deduplication/deduplication.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreModule.forRoot(),
    DeduplicationPageRoutingModule,
    // DedupicationModule
  ],
  declarations: [
    DeduplicationPageComponent
  ]
})
export class DeduplicationPageModule {

}
