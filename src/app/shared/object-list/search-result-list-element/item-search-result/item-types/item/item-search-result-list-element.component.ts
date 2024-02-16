import { Component, Input, OnInit } from '@angular/core';
import {
  listableObjectComponent
} from '../../../../../object-collection/shared/listable-object/listable-object.decorator';
import { ViewMode } from '../../../../../../core/shared/view-mode.model';
import { ItemSearchResult } from '../../../../../object-collection/shared/item-search-result.model';
import { SearchResultListElementComponent } from '../../../search-result-list-element.component';
import { Item } from '../../../../../../core/shared/item.model';
import { getItemPageRoute } from '../../../../../../item-page/item-page-routing-paths';
import { Context } from '../../../../../../core/shared/context.model';
import { differenceInDays, differenceInMilliseconds, parseISO } from 'date-fns';
import { environment } from '../../../../../../../environments/environment';

@listableObjectComponent('PublicationSearchResult', ViewMode.ListElement)
@listableObjectComponent(ItemSearchResult, ViewMode.ListElement)
@listableObjectComponent(ItemSearchResult, ViewMode.ListElement, Context.BrowseMostElements)
@Component({
  selector: 'ds-item-search-result-list-element',
  styleUrls: ['./item-search-result-list-element.component.scss'],
  templateUrl: './item-search-result-list-element.component.html'
})
/**
 * The component for displaying a list element for an item search result of the type Publication
 */
export class ItemSearchResultListElementComponent extends SearchResultListElementComponent<ItemSearchResult, Item> implements OnInit {

  /**
   * Whether to show the metrics badges
   */
  @Input() showMetrics = true;

  /**
   * Route to the item's page
   */
  itemPageRoute: string;

  authorMetadata = environment.searchResult.authorMetadata;

  ngOnInit(): void {
    super.ngOnInit();
    this.showThumbnails = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    this.itemPageRoute = getItemPageRoute(this.dso);
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

}
