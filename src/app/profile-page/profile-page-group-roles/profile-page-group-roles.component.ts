import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { hasValue } from '../../shared/empty.util';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { getFirstCompletedRemoteData, getRemoteDataPayload } from '../../core/shared/operators';
import { EPersonDataService } from '../../core/eperson/eperson-data.service';
import { groupRoles } from './group-roles';

@Component({
  selector: 'ds-profile-page-group-roles',
  templateUrl: './profile-page-group-roles.component.html',
  styleUrls: [ './profile-page-group-roles.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePageGroupRolesComponent {

  private groupRoleId$ = this.route.params.pipe(map((p) => p.id as string));

  groupRole$ = this.groupRoleId$.pipe(
    switchMap((id: string) => this.userGroups$.pipe(
      map((groups) => groups.find((group) => group.id === id))
    ))
  );

  private userGroups$ = this.authService.getAuthenticatedUserFromStore().pipe(
    filter((user: EPerson) => hasValue(user.id)),
    switchMap((user: EPerson) => this.epersonService.findById(user.id, true, true, followLink('groups'))),
    getFirstCompletedRemoteData(),
    getRemoteDataPayload(),
    switchMap((user: EPerson) => user.groups.pipe(
      map((groups) => groups.payload.page)
    ))
  );

  groupRoles = groupRoles;
  tableColumns = Object.keys(groupRoles[0]);

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private epersonService: EPersonDataService
  ) {}

}
