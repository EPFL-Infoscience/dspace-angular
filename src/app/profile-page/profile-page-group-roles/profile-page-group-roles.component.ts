import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GroupRoles } from './group-roles';

@Component({
  selector: 'ds-profile-page-group-roles',
  templateUrl: './profile-page-group-roles.component.html',
  styleUrls: [ './profile-page-group-roles.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePageGroupRolesComponent {
  groupRoles = GroupRoles;
  tableColumns = Object.keys(GroupRoles[0]);
}
