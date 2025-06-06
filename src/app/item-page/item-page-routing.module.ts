import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItemPageResolver } from './item-page.resolver';
import { AuthenticatedGuard } from '../core/auth/authenticated.guard';
import { ItemBreadcrumbResolver } from '../core/breadcrumbs/item-breadcrumb.resolver';
import { VersionResolver } from './version-page/version.resolver';
import { DSOBreadcrumbsService } from '../core/breadcrumbs/dso-breadcrumbs.service';
import { LinkService } from '../core/cache/builders/link.service';
import { UploadBitstreamComponent } from './bitstreams/upload/upload-bitstream.component';
import { ITEM_EDIT_PATH, ORCID_PATH, UNPAYWALL_VERSIONS_PATH, UPLOAD_BITSTREAM_PATH, VIEWERS_PATH } from './item-page-routing-paths';
import { ItemPageAdministratorGuard } from './item-page-administrator.guard';
import { LinkMenuItemModel } from '../shared/menu/menu-item/models/link.model';
import { ThemedItemPageComponent } from './simple/themed-item-page.component';
import { ThemedFullItemPageComponent } from './full/themed-full-item-page.component';
import { MenuItemType } from '../shared/menu/menu-item-type.model';
import { VersionPageComponent } from './version-page/version-page/version-page.component';
import { BitstreamRequestACopyPageComponent } from './bitstreams/request-a-copy/bitstream-request-a-copy-page.component';
import { REQUEST_COPY_MODULE_PATH } from '../app-routing-paths';
import { CrisItemPageTabResolver } from './cris-item-page-tab.resolver';
import { OrcidPageComponent } from './orcid-page/orcid-page.component';
import { OrcidPageGuard } from './orcid-page/orcid-page.guard';
import { UnpaywallVersionsComponent } from './unpaywall-versions/unpaywall-versions.component';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: ':id',
        resolve: {
          dso: ItemPageResolver,
          breadcrumb: ItemBreadcrumbResolver,
        },
        runGuardsAndResolvers: 'always',
        children: [
          {
            path: '',
            component: ThemedItemPageComponent,
            pathMatch: 'full',
            resolve: {
              tabs: CrisItemPageTabResolver
            }
          },
          {
            path: 'full',
            component: ThemedFullItemPageComponent,
          },
          {
            path: ITEM_EDIT_PATH,
            loadChildren: () => import('./edit-item-page/edit-item-page.module')
              .then((m) => m.EditItemPageModule),
            canActivate: [ItemPageAdministratorGuard],
            data: { title: 'submission.edit.title' }
          },
          {
            path: UPLOAD_BITSTREAM_PATH,
            component: UploadBitstreamComponent,
            canActivate: [AuthenticatedGuard]
          },
          {
            path: REQUEST_COPY_MODULE_PATH,
            component: BitstreamRequestACopyPageComponent,
          },
          {
            path: ORCID_PATH,
            component: OrcidPageComponent,
            canActivate: [AuthenticatedGuard, OrcidPageGuard]
          },
          {
            path: VIEWERS_PATH,
            loadChildren: () => import('./viewer-provider/viewer-provider.module').then(m => m.ViewerProviderModule)
          },
          {
            path: UNPAYWALL_VERSIONS_PATH,
            component: UnpaywallVersionsComponent,
            resolve: {
              breadcrumb: I18nBreadcrumbResolver,
            },
            data: {
              title: 'submission.unpaywall.versions.title',
              breadcrumbKey: 'submission.unpaywall.versions',
              showBreadcrumbs: true,
            }
          },
          {
            path: ':tab',
            component: ThemedItemPageComponent,
            resolve: {
              tabs: CrisItemPageTabResolver
            },
            children: [
              {
                path: VIEWERS_PATH,
                loadChildren: () => import('./viewer-provider/viewer-provider.module').then(m => m.ViewerProviderModule)
              }
            ],
          }
        ],
        data: {
          menu: {
            public: [{
              id: 'statistics_item_:id',
              active: true,
              visible: false,
              index: 2,
              model: {
                type: MenuItemType.LINK,
                text: 'menu.section.statistics',
                link: 'statistics/items/:id/',
              } as LinkMenuItemModel,
            }],
          },
          showSocialButtons: true
        },
      },
      {
        path: 'version',
        children: [
          {
            path: ':id',
            component: VersionPageComponent,
            resolve: {
              dso: VersionResolver,
            },
          }
        ],
      }
    ])
  ],
  providers: [
    ItemPageResolver,
    ItemBreadcrumbResolver,
    DSOBreadcrumbsService,
    LinkService,
    ItemPageAdministratorGuard,
    VersionResolver,
    OrcidPageGuard,
    CrisItemPageTabResolver
  ]

})
export class ItemPageRoutingModule {

}
