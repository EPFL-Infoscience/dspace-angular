import { AfterViewInit, Component, Inject, Input, OnInit, Optional } from '@angular/core';
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
import { KlaroService } from '../../../../../cookies/klaro.service';
import { combineLatest, Observable } from 'rxjs';
import { TruncatableService } from '../../../../../truncatable/truncatable.service';
import { DSONameService } from '../../../../../../core/breadcrumbs/dso-name.service';
import { APP_CONFIG, AppConfig } from '../../../../../../../config/app-config.interface';
import { getFirstSucceededRemoteListPayload } from '../../../../../../core/shared/operators';
import { map } from 'rxjs/operators';
import { isNotEmpty } from '../../../../../empty.util';

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
export class ItemSearchResultListElementComponent extends SearchResultListElementComponent<ItemSearchResult, Item> implements OnInit, AfterViewInit {

  /**
   * Whether to show the metrics badges
   */
  @Input() showMetrics = true;

  /**
   * Route to the item's page
   */
  itemPageRoute: string;

  authorMetadata = environment.searchResult.authorMetadata;

  hasLoadedThirdPartyMetrics$: Observable<boolean>;

  accessionedDate: string;
  workflowStartDate: string;
  itemDateTime: string;
  itemArchivedDateTime: string;

  private thirdPartyMetrics = environment.info.metricsConsents.filter(metric => metric.enabled).map(metric => metric.key);


  constructor(
    protected truncatableService: TruncatableService,
    public dsoNameService: DSONameService,
    @Inject(APP_CONFIG) protected appConfig?: AppConfig,
    @Optional() private klaroService?: KlaroService,
  ) {
    super(truncatableService, dsoNameService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.itemPageRoute = getItemPageRoute(this.dso);
    this.accessionedDate = this.dso.firstMetadataValue('dc.date.accessioned');
    this.workflowStartDate = this.dso.firstMetadataValue('epfl.workflow.startDateTime');
    if (isNotEmpty(this.workflowStartDate)) {
      this.itemDateTime = this.getDateForItem(this.workflowStartDate);
      if (isNotEmpty(this.accessionedDate)) {
        this.itemArchivedDateTime = this.getDateForArchivedItem(
          this.workflowStartDate,
          this.accessionedDate
        );
      }
    }

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

  /**
   * Check if item has Third-party metrics blocked by consents
   */
  ngAfterViewInit() {
    if (this.showMetrics && this.klaroService) {
      this.klaroService.watchConsentUpdates();

      this.hasLoadedThirdPartyMetrics$ = combineLatest([
        this.klaroService.consentsUpdates$,
        this.dso.metrics?.pipe(
          getFirstSucceededRemoteListPayload(),
          map(metrics => {
            return metrics.filter(metric => this.thirdPartyMetrics.includes(metric.metricType));
          })
        )
      ]).pipe(
        map(([consents, metrics]) => {
          return metrics.reduce((previous, current) => {
            return consents[current.metricType] && previous;
          }, true);
        })
      );
    }
  }

  /**
   * Prompt user for consents settings
   */
  showSettings() {
    this.klaroService.showSettings();
  }
}
