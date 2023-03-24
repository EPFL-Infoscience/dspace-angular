import { ChangeDetectionStrategy, Component, Inject, InjectionToken, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { SearchService } from '../core/shared/search/search.service';
import { MyDSpaceResponseParsingService } from '../core/data/mydspace-response-parsing.service';
import { SearchConfigurationOption } from '../shared/search/search-switch-configuration/search-configuration-option.model';
import { SearchConfigurationService } from '../core/shared/search/search-configuration.service';
import { MyDSpaceConfigurationService } from './my-dspace-configuration.service';
import { ViewMode } from '../core/shared/view-mode.model';
import { MyDSpaceRequest } from '../core/data/request.models';
import { Context } from '../core/shared/context.model';
import { RoleType } from '../core/roles/role-types';
import { AuthService } from '../core/auth/auth.service';
import { environment } from '../../environments/environment';

export const MYDSPACE_ROUTE = '/mydspace';
export const SEARCH_CONFIG_SERVICE: InjectionToken<SearchConfigurationService> = new InjectionToken<SearchConfigurationService>('searchConfigurationService');

/**
 * This component represents the whole mydspace page
 */
@Component({
  selector: 'ds-my-dspace-page',
  styleUrls: ['./my-dspace-page.component.scss'],
  templateUrl: './my-dspace-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: MyDSpaceConfigurationService
    }
  ]
})
export class MyDSpacePageComponent implements OnInit {

  /**
   * The list of available configuration options
   */
  configurationList$: Observable<SearchConfigurationOption[]>;

  /**
   * The start context to use in the search: workspace or workflow
   */
  context: Context;

  /**
   * The start configuration to use in the search: workspace or workflow
   */
  configuration: string;

  /**
   * Variable for enumeration RoleType
   */
  roleTypeEnum = RoleType;

  /**
   * Projection to use during the search
   */
  projection = 'preventMetadataSecurity';

  /**
   * List of available view mode
   */
  viewModeList = [ViewMode.ListElement, ViewMode.DetailedListElement];

  rssFeedUrl$ = this.generateRssFeedUrl();

  constructor(
    @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: MyDSpaceConfigurationService,
    private service: SearchService,
    private authService: AuthService,
  ) {
    this.service.setServiceOptions(MyDSpaceResponseParsingService, MyDSpaceRequest);
  }

  /**
   * Initialize available configuration list
   *
   * Listening to changes in the paginated search options
   * If something changes, update the search results
   *
   * Listen to changes in the scope
   * If something changes, update the list of scopes for the dropdown
   *
   * Listen to changes in the configuration
   * If something changes, update the current context
   */
  ngOnInit(): void {
    this.configurationList$ = this.searchConfigService.getAvailableConfigurationOptions();

    this.configurationList$.pipe(take(1)).subscribe((configurationList: SearchConfigurationOption[]) => {
      this.configuration = configurationList[0].value;
      this.context = configurationList[0].context;
    });

  }

  /**
    * Method to generate the RSS feed url based on the current user
   */
  private generateRssFeedUrl() {
    let baseUrl = environment.rest.baseUrl;
    let url = '/opensearch/search?query=';

    return this.authService.getAuthenticatedUserFromStore().pipe(map(user => {
      console.log('user', user);
      // TODO: implement the other cases when the user is an submitter or an editor or an author
      // if (user.type === RoleType.ADMIN) {
      // /server/opensearch/search?query=(
      // author_authority:<uuid of the author>
      // OR
      // submitter_authority:<uuid of the eperson>
      // OR
      // editor_authority:<uuid of the editor>

      // url += '(author_authority:' + user.uuid + ' OR submitter_authority:' + user.uuid + ' OR editor_authority:' + user.uuid + ')';
      return baseUrl + url + `(submitter_authority:${user.uuid})`;
    }));

  }

}
