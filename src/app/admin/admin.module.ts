import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AccessControlModule } from '../access-control/access-control.module';
import { MetadataImportPageComponent } from './admin-import-metadata-page/metadata-import-page.component';
import { AdminRegistriesModule } from './admin-registries/admin-registries.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminCurationTasksComponent } from './admin-curation-tasks/admin-curation-tasks.component';
import { AdminWorkflowModuleModule } from './admin-workflow-page/admin-workflow.module';
import { AdminSearchModule } from './admin-search-page/admin-search.module';
import { AdminSidebarSectionComponent } from './admin-sidebar/admin-sidebar-section/admin-sidebar-section.component';
import { ExpandableAdminSidebarSectionComponent } from './admin-sidebar/expandable-admin-sidebar-section/expandable-admin-sidebar-section.component';
import { AdminEditUserAgreementComponent } from './admin-edit-user-agreement/admin-edit-user-agreement.component';
import {EditCmsMetadataComponent} from './edit-cms-metadata/edit-cms-metadata.component';
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.component.module';
import { NuMarkdownModule } from '@ng-util/markdown';

const ENTRY_COMPONENTS = [
  // put only entry components that use custom decorator
  AdminSidebarSectionComponent,
  ExpandableAdminSidebarSectionComponent,
];


@NgModule({
  imports: [
    AdminRoutingModule,
    AdminRegistriesModule,
    AccessControlModule,
    MarkdownEditorModule,
    NuMarkdownModule,
    AdminSearchModule.withEntryComponents(),
    AdminWorkflowModuleModule.withEntryComponents(),
    SharedModule
  ],
  declarations: [
    AdminCurationTasksComponent,
    MetadataImportPageComponent,
    AdminEditUserAgreementComponent,
    EditCmsMetadataComponent
  ]
})
export class AdminModule {
  /**
   * NOTE: this method allows to resolve issue with components that using a custom decorator
   * which are not loaded during SSR otherwise
   */
  static withEntryComponents() {
    return {
      ngModule: AdminModule,
      providers: ENTRY_COMPONENTS.map((component) => ({provide: component}))
    };
  }
}
