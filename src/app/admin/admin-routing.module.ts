import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MetadataImportPageComponent } from './admin-import-metadata-page/metadata-import-page.component';
import { AdminSearchPageComponent } from './admin-search-page/admin-search-page.component';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { AdminWorkflowPageComponent } from './admin-workflow-page/admin-workflow-page.component';
import { I18nBreadcrumbsService } from '../core/breadcrumbs/i18n-breadcrumbs.service';
import { AdminCurationTasksComponent } from './admin-curation-tasks/admin-curation-tasks.component';
import { AdminEditUserAgreementComponent } from './admin-edit-user-agreement/admin-edit-user-agreement.component';
import { NOTIFICATIONS_MODULE_PATH, REGISTRIES_MODULE_PATH } from './admin-routing-paths';
import { EditCmsMetadataComponent } from './edit-cms-metadata/edit-cms-metadata.component';
import { BatchImportPageComponent } from './admin-import-batch-page/batch-import-page.component';
import { AdminLanguageFilesComponent } from './admin-language-files/admin-language-files.component';
import {
  CollectionAdministratorGuard
} from '../core/data/feature-authorization/feature-authorization-guard/collection-administrator.guard';
import {
  SiteAdministratorGuard
} from '../core/data/feature-authorization/feature-authorization-guard/site-administrator.guard';
import { EndUserAgreementCurrentUserGuard } from '../core/end-user-agreement/end-user-agreement-current-user.guard';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: NOTIFICATIONS_MODULE_PATH,
        loadChildren: () => import('./admin-notifications/admin-notifications.module')
          .then((m) => m.AdminNotificationsModule),
        canActivate: [SiteAdministratorGuard, EndUserAgreementCurrentUserGuard],
      },
      {
        path: REGISTRIES_MODULE_PATH,
        loadChildren: () => import('./admin-registries/admin-registries.module')
          .then((m) => m.AdminRegistriesModule),
        canActivate: [SiteAdministratorGuard, EndUserAgreementCurrentUserGuard],
      },
      {
        path: 'search',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: AdminSearchPageComponent,
        canActivate: [CollectionAdministratorGuard, EndUserAgreementCurrentUserGuard],
        data: { title: 'admin.search.title', breadcrumbKey: 'admin.search' }
      },
      {
        path: 'workflow',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: AdminWorkflowPageComponent,
        canActivate: [SiteAdministratorGuard, EndUserAgreementCurrentUserGuard],
        data: { title: 'admin.workflow.title', breadcrumbKey: 'admin.workflow' }
      },
      {
        path: 'curation-tasks',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: AdminCurationTasksComponent,
        canActivate: [SiteAdministratorGuard, EndUserAgreementCurrentUserGuard],
        data: { title: 'admin.curation-tasks.title', breadcrumbKey: 'admin.curation-tasks' }
      },
      {
        path: 'metadata-import',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: MetadataImportPageComponent,
        canActivate: [SiteAdministratorGuard, EndUserAgreementCurrentUserGuard],
        data: { title: 'admin.metadata-import.title', breadcrumbKey: 'admin.metadata-import' }
      },
      {
        path: 'edit-user-agreement',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: AdminEditUserAgreementComponent,
        canActivate: [SiteAdministratorGuard, EndUserAgreementCurrentUserGuard],
        data: { title: 'admin.edit-user-agreement.title', breadcrumbKey: 'admin.edit-user-agreement' }
      },
      {
        path: 'edit-cms-metadata',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: EditCmsMetadataComponent,
        canActivate: [SiteAdministratorGuard, EndUserAgreementCurrentUserGuard],
        data: { title: 'admin.edit-cms-metadata.title', breadcrumbKey: 'admin.edit-cms-metadata' }
      },
      {
        path: 'batch-import',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: BatchImportPageComponent,
        canActivate: [SiteAdministratorGuard, EndUserAgreementCurrentUserGuard],
        data: { title: 'admin.batch-import.title', breadcrumbKey: 'admin.batch-import' }
      },
      {
        path: 'language-files',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        component: AdminLanguageFilesComponent,
        canActivate: [SiteAdministratorGuard, EndUserAgreementCurrentUserGuard],
        data: { title: 'admin.language-files.title', breadcrumbKey: 'admin.language-labels' }
      },
    ])
  ],
  providers: [
    I18nBreadcrumbResolver,
    I18nBreadcrumbsService
  ]
})
export class AdminRoutingModule {

}
