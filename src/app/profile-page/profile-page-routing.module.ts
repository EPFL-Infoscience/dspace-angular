import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { ThemedProfilePageComponent } from './themed-profile-page.component';
import { ProfilePageGroupRolesComponent } from './profile-page-group-roles/profile-page-group-roles.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ThemedProfilePageComponent,
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: { breadcrumbKey: 'profile', title: 'profile.title' }
      },
      {
        path: 'group-roles/:id',
        component: ProfilePageGroupRolesComponent,
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: { breadcrumbKey: 'profile.group-roles', title: 'profile.group-roles.title' }
      }
    ])
  ]
})
export class ProfilePageRoutingModule {}
