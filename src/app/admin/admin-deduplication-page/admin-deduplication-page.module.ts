import { GetItemStatusListPipe } from './../../deduplication/sets/pipes/get-item-status-list.pipe';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';
import { AdminDeduplicationPageComponent } from './admin-deduplication-page.component';
import { AdminDeduplicationPageRoutingModule } from './admin-deduplication-page.routing.module';
import { DedupicationModule } from '../../deduplication/deduplication.module';
import { DeduplicationSetsComponent } from './../../deduplication/sets/deduplication-sets.component';
import { DeduplicationMergeComponent } from './../../deduplication/deduplication-merge/deduplication-merge.component';

const COMPONENTS = [
  AdminDeduplicationPageComponent,
  DeduplicationSetsComponent,
  DeduplicationMergeComponent,
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreModule.forRoot(),
    AdminDeduplicationPageRoutingModule,
    DedupicationModule,
    NgbAccordionModule
  ],
  declarations: [
    ...COMPONENTS,
    GetItemStatusListPipe
  ],
  entryComponents: []
})
export class AdminDeduplicationPageModule { }
