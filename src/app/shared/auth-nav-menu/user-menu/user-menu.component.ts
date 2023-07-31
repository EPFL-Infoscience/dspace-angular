import { Component, Input, OnInit } from '@angular/core';

import { Observable, switchMap } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { EPerson } from '../../../core/eperson/models/eperson.model';
import { AppState } from '../../../app.reducer';
import { isAuthenticationLoading } from '../../../core/auth/selectors';
import { MYDSPACE_ROUTE } from '../../../my-dspace-page/my-dspace-page.component';
import { AuthService } from '../../../core/auth/auth.service';
import {
  getProfileModuleRoute,
  getStatisticsModuleRoute,
  getSubscriptionsModuleRoute,
} from '../../../app-routing-paths';
import { map, mergeMap } from 'rxjs/operators';
import { URLCombiner } from '../../../core/url-combiner/url-combiner';
import { followLink } from '../../utils/follow-link-config.model';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { ResearcherProfileDataService } from '../../../core/profile/researcher-profile-data.service';

/**
 * This component represents the user nav menu.
 */
@Component({
  selector: 'ds-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  /**
   * The input flag to show user details in navbar expandable menu
   */
  @Input() inExpandableNavbar = false;

  /**
   * True if the authentication is loading.
   * @type {Observable<boolean>}
   */
  public loading$: Observable<boolean>;

  /**
   * The authenticated user.
   * @type {Observable<EPerson>}
   */
  public user$: Observable<EPerson>;

  public userId$: Observable<string>;

  private researcherProfileId$: Observable<string>;

  /**
   * The mydspace page route.
   * @type {string}
   */
  public mydspaceRoute = MYDSPACE_ROUTE;

  /**
   * The profile page route
   */
  public profileRoute = getProfileModuleRoute();

  /**
   * The profile page route
   */
  public subscriptionsRoute = getSubscriptionsModuleRoute();

  public userStatisticsRoute: string;

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private researcherProfileService: ResearcherProfileDataService,
  ) {
  }

  /**
   * Initialize all instance variables
   */
  ngOnInit(): void {

    // set loading
    this.loading$ = this.store.pipe(select(isAuthenticationLoading));

    // set user
    this.user$ = this.authService.getAuthenticatedUserFromStore();

    this.userId$ = this.user$.pipe(
      // tap(console.info),
      map((user) => user.uuid),
    );

    this.researcherProfileId$ = this.userId$.pipe(
      switchMap((uuid) => this.researcherProfileService.findById(uuid, false, true, followLink('item'))),
      getFirstSucceededRemoteDataPayload(),
      mergeMap((researcherProfile) => this.researcherProfileService.findRelatedItemId(researcherProfile)),
    );

    this.researcherProfileId$.subscribe((uuid) => {
      this.userStatisticsRoute = new URLCombiner(getStatisticsModuleRoute(), 'items', uuid).toString();
      console.log('USR', this.userStatisticsRoute);
    });

  }
}
