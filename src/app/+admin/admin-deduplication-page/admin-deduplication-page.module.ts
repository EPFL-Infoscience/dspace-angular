import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';
import { AdminDeduplicationPageComponent } from './admin-deduplication-page.component';
import { AdminDeduplicationPageRoutingModule } from './admin-deduplication-page.routing.module';
import { DedupicationModule } from '../../deduplication/deduplication.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreModule.forRoot(),
    AdminDeduplicationPageRoutingModule,
    DedupicationModule
  ],
  declarations: [
    AdminDeduplicationPageComponent
  ],
  entryComponents: []
})
export class AdminDeduplicationPageModule {

}
