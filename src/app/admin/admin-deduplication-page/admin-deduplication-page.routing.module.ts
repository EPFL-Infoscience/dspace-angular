import { DeduplicationSetsComponent } from './../../deduplication/sets/deduplication-sets.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthenticatedGuard } from '../../core/auth/authenticated.guard';
import { AdminDeduplicationPageComponent } from './admin-deduplication-page.component';
import { I18nBreadcrumbsService } from '../../core/breadcrumbs/i18n-breadcrumbs.service';
import { I18nBreadcrumbResolver } from '../../core/breadcrumbs/i18n-breadcrumb.resolver';
import { DeduplicationMergeComponent } from './../../deduplication/deduplication-merge/deduplication-merge.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        canActivate: [AuthenticatedGuard],
        path: '',
        component: AdminDeduplicationPageComponent,
        pathMatch: 'full',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: {
          title: 'deduplication.page.title',
          breadcrumbKey: 'deduplication',
          showBreadcrumbsFluid: false
        },
      },
      {
        canActivate: [AuthenticatedGuard],
        path: 'set/:id/:rule',
        component: DeduplicationSetsComponent,
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: {
          title: 'sets.breadcrumbs',
          breadcrumbKey: 'sets',
          showBreadcrumbsFluid: false
        }
        // ,
        // children: [
        //   {
        //     path: 'compare/:setId',
        //     component: DeduplicationMergeComponent,
        //     resolve: { breadcrumb: I18nBreadcrumbResolver },
        //     data: {
        //       title: 'Compare Deduplications',
        //       breadcrumbKey: 'compare',
        //       showBreadcrumbsFluid: false
        //     },
        //   }
        // ]
      },
      {
        canActivate: [AuthenticatedGuard],
        path: 'compare/:setId',
        component: DeduplicationMergeComponent,
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: {
          title: 'Compare Deduplications',
          breadcrumbKey: 'compare',
          showBreadcrumbsFluid: false
        },
      }
    ])
  ],
  providers: [
    I18nBreadcrumbResolver,
    I18nBreadcrumbsService
  ]
})
export class AdminDeduplicationPageRoutingModule {
}
