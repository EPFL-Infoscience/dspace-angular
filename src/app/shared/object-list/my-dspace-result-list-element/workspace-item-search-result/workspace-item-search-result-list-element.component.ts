import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { LinkService } from '../../../../core/cache/builders/link.service';
import { Item } from '../../../../core/shared/item.model';

import { ViewMode } from '../../../../core/shared/view-mode.model';
import { WorkspaceItem } from '../../../../core/submission/models/workspaceitem.model';
import { listableObjectComponent } from '../../../object-collection/shared/listable-object/listable-object.decorator';
import { WorkspaceItemSearchResult } from '../../../object-collection/shared/workspace-item-search-result.model';
import { TruncatableService } from '../../../truncatable/truncatable.service';
import {
  SearchResultListElementComponent
} from '../../search-result-list-element/search-result-list-element.component';
import { DSONameService } from '../../../../core/breadcrumbs/dso-name.service';
import { APP_CONFIG, AppConfig } from '../../../../../config/app-config.interface';
import { ItemSearchResult } from '../../../object-collection/shared/item-search-result.model';
import { map, shareReplay, tap } from 'rxjs/operators';
import { getFirstSucceededRemoteDataPayload } from '../../../../core/shared/operators';
import { CollectionElementLinkType } from '../../../object-collection/collection-element-link.type';
import { followLink } from '../../../utils/follow-link-config.model';
import { Context } from '../../../../core/shared/context.model';

/**
 * This component renders workspaceitem object for the search result in the list view.
 */
@Component({
  selector: 'ds-workspace-item-search-result-list-element',
  styleUrls: ['../../search-result-list-element/search-result-list-element.component.scss', './workspace-item-search-result-list-element.component.scss'],
  templateUrl: './workspace-item-search-result-list-element.component.html',
})

@listableObjectComponent(WorkspaceItemSearchResult, ViewMode.ListElement)
export class WorkspaceItemSearchResultListElementComponent extends SearchResultListElementComponent<WorkspaceItemSearchResult, WorkspaceItem> implements OnInit {

  LinkTypes = CollectionElementLinkType;

  ViewModes = ViewMode;

  /**
   * The item search result derived from the WorkspaceItemSearchResult
   */
  derivedSearchResult$: Observable<ItemSearchResult>;

  item$: Observable<Item>;

  submitterEmail = new BehaviorSubject<string>('');

  /**
   * Represents the badge context
   */
  public badgeContext = Context.MyDSpaceWorkspace;

  /**
   * Display thumbnails if required by configuration
   */
  showThumbnails: boolean;

  @Output() customEvent = new EventEmitter<any>();

  constructor(
    protected truncatableService: TruncatableService,
    protected linkService: LinkService,
    public dsoNameService: DSONameService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig
  ) {
    super(truncatableService, dsoNameService, appConfig);
  }

  /**
   * Initialize all instance variables
   */
  ngOnInit() {
    super.ngOnInit();
    this.deriveSearchResult();
  }

  private deriveSearchResult() {
    this.linkService.resolveLink(this.object.indexableObject, followLink('item'));
    const itemObject$ = this.object.indexableObject.item.pipe(shareReplay());
    this.item$ = itemObject$.pipe(getFirstSucceededRemoteDataPayload());
    this.derivedSearchResult$ = itemObject$.pipe(
      getFirstSucceededRemoteDataPayload(),
      map((item: Item) => {
        const result = new ItemSearchResult();
        result.indexableObject = item;
        result.hitHighlights = this.object.hitHighlights;
        return result;
      }),
      tap((res: ItemSearchResult) => {
        const email = res.indexableObject.submitterEmail;
        this.submitterEmail.next(email);
      }),
      shareReplay(1),
    );
  }
}
