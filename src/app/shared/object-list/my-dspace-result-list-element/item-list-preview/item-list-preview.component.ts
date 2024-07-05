import { Component, Inject, Input, OnInit } from '@angular/core';

import { Item } from '../../../../core/shared/item.model';
import { fadeInOut } from '../../../animations/fade';
import { SearchResult } from '../../../search/models/search-result.model';
import { APP_CONFIG, AppConfig } from '../../../../../config/app-config.interface';
import { DSONameService } from '../../../../core/breadcrumbs/dso-name.service';
import { Context } from '../../../../core/shared/context.model';
import { WorkflowItem } from '../../../../core/submission/models/workflowitem.model';
import {
  DuplicateMatchMetadataDetailConfig
} from '../../../../submission/sections/detect-duplicate/models/duplicate-detail-metadata.model';
import { differenceInDays, differenceInMilliseconds, parseISO } from 'date-fns';
import { environment } from '../../../../../environments/environment';
import { Observable, switchMap } from 'rxjs';
import {FeatureID} from '../../../../core/data/feature-authorization/feature-id';
import {AuthorizationDataService} from '../../../../core/data/feature-authorization/authorization-data.service';
import { ItemDataService } from '../../../../core/data/item-data.service';
import { hasValue } from '../../../empty.util';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';
import { map } from 'rxjs/operators';

/**
 * This component show metadata for the given item object in the list view.
 */
@Component({
  selector: 'ds-item-list-preview',
  styleUrls: ['item-list-preview.component.scss'],
  templateUrl: 'item-list-preview.component.html',
  animations: [fadeInOut]
})
export class ItemListPreviewComponent implements OnInit {

  /**
   * The item to display
   */
  @Input() item: Item;

  /**
   * The search result object
   */
  @Input() object: SearchResult<any>;

  /**
   * Represents the badge context
   */
  @Input() badgeContext: Context;

  /**
   * A boolean representing if to show submitter information
   */
  @Input() showSubmitter = false;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails;

  /**
   * An object representing the duplicate match
   */
  @Input() metadataList: DuplicateMatchMetadataDetailConfig[] = [];

  /**
   * Represents the workflow of the item
   */
  @Input() workflowItem: WorkflowItem;

  dsoTitle: string;

  authorMetadata = environment.searchResult.authorMetadata;

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    public dsoNameService: DSONameService,
    private authorizationService: AuthorizationDataService,
    private itemDataService: ItemDataService
  ) {
  }

  ngOnInit(): void {
    this.showThumbnails = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    this.dsoTitle = this.dsoNameService.getHitHighlights(this.object, this.item);
  }

  getDateForArchivedItem(itemStartDate: string, dateAccessioned: string) {
    const itemStartDateConverted: Date = parseISO(itemStartDate);
    const dateAccessionedConverted: Date = parseISO(dateAccessioned);
    const days: number = Math.max(0, Math.floor(differenceInDays(dateAccessionedConverted, itemStartDateConverted)));
    const remainingMilliseconds: number = differenceInMilliseconds(dateAccessionedConverted, itemStartDateConverted) - days * 24 * 60 * 60 * 1000;
    const hours: number = Math.max(0, Math.floor(remainingMilliseconds / (60 * 60 * 1000)));
    return `${days} d ${hours} h`;
  }

  getDateForItem(itemStartDate: string) {
    const itemStartDateConverted: Date = parseISO(itemStartDate);
    const days: number = Math.max(0, Math.floor(differenceInDays(Date.now(), itemStartDateConverted)));
    const remainingMilliseconds: number = differenceInMilliseconds(Date.now(), itemStartDateConverted) - days * 24 * 60 * 60 * 1000;
    const hours: number = Math.max(0, Math.floor(remainingMilliseconds / (60 * 60 * 1000)));
    return `${days} d ${hours} h`;
  }

  public canViewInWorkflowSinceStatistics(useCacheVersion = true): Observable<boolean> {
    if (hasValue(this.item?.self)) {
      return this.isUserAuthorizedToViewItemInWorkflow(this.item.self, useCacheVersion);
    } else {
      // If self link has no value we fetch again the item from the rest.
      // Since at this stage the item has most likely already been fetched we will get it from the cache
      return this.itemDataService.findById(this.item.id).pipe(
        getFirstCompletedRemoteData(),
        map(data => data.payload.self),
        switchMap(selfLink => this.isUserAuthorizedToViewItemInWorkflow(selfLink, useCacheVersion))
      );
    }
  }

  private isUserAuthorizedToViewItemInWorkflow(selfLink: string, useCacheVersion = true): Observable<boolean> {
    return this.authorizationService.isAuthorized(FeatureID.CanViewInWorkflowSinceStatistics, selfLink, null,  useCacheVersion);
  }
}
