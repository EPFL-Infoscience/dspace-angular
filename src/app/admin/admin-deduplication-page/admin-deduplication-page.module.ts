import { GetItemStatusListPipe } from './../../deduplication/pipes/get-item-status-list.pipe';
import { EditItemPageModule } from './../../item-page/edit-item-page/edit-item-page.module';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';
import { AdminDeduplicationPageComponent } from './admin-deduplication-page.component';
import { AdminDeduplicationPageRoutingModule } from './admin-deduplication-page.routing.module';
import { DedupicationModule } from '../../deduplication/deduplication.module';
import { DeduplicationMergeComponent } from './../../deduplication/deduplication-merge/deduplication-merge.component';
import { DeduplicationSetsComponent } from '../../deduplication/sets/sets-component/deduplication-sets.component';

const COMPONENTS = [
  AdminDeduplicationPageComponent,
  DeduplicationSetsComponent,
  DeduplicationMergeComponent,
];

const PIPES = [
  GetItemStatusListPipe
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreModule.forRoot(),
    AdminDeduplicationPageRoutingModule,
    DedupicationModule,
    NgbAccordionModule,
    EditItemPageModule
  ],
  declarations: [
    ...COMPONENTS,
    ...PIPES
  ],
  entryComponents: []
})
export class AdminDeduplicationPageModule { }
