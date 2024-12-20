import { AfterViewInit, Component, Inject, Input, OnInit, Optional } from '@angular/core';
import {
  listableObjectComponent
} from '../../../../../object-collection/shared/listable-object/listable-object.decorator';
import { ViewMode } from '../../../../../../core/shared/view-mode.model';
import { ItemSearchResult } from '../../../../../object-collection/shared/item-search-result.model';
import { SearchResultListElementComponent } from '../../../search-result-list-element.component';
import { Item } from '../../../../../../core/shared/item.model';
import { getItemPageRoute, getItemViewerPath } from '../../../../../../item-page/item-page-routing-paths';
import { Context } from '../../../../../../core/shared/context.model';
import { environment } from '../../../../../../../environments/environment';
import { KlaroService } from '../../../../../cookies/klaro.service';
import { combineLatest, Observable } from 'rxjs';
import { TruncatableService } from '../../../../../truncatable/truncatable.service';
import { DSONameService } from '../../../../../../core/breadcrumbs/dso-name.service';
import { APP_CONFIG, AppConfig } from '../../../../../../../config/app-config.interface';
import { getFirstSucceededRemoteListPayload } from '../../../../../../core/shared/operators';
import { filter, map } from 'rxjs/operators';
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

  itemViewerRoute: string;

  authorMetadata = environment.searchResult.authorMetadata;

  fullTextHighlights: string[];

  fullTextMirador: string[];

  fullTextVideo: string[];

  hasLoadedThirdPartyMetrics$: Observable<boolean>;

  placeholder: string;
  thumbnailAlt: string;
  defaultImage: string;

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
    this.itemViewerRoute = getItemViewerPath(this.dso, 'iiif');
    this.fullTextHighlights = this.allMetadataValues('fulltext');
    this.fullTextMirador = this.allMetadataValues('fulltext.mirador');
    this.fullTextVideo = this.allMetadataValues('fulltext.video');

    const eType = this.dso.firstMetadataValue('dspace.entity.type');
    switch (eType?.toUpperCase()) {
      case 'PROJECT':
        this.placeholder = 'thumbnail.project.placeholder';
        this.defaultImage = 'assets/images/project-placeholder.svg';
        this.thumbnailAlt = 'thumbnail.project.alt';
        break;
      case 'ORGUNIT':
        this.placeholder = 'thumbnail.orgunit.placeholder';
        this.defaultImage = 'assets/images/orgunit-placeholder.svg';
        this.thumbnailAlt = 'thumbnail.orgunit.alt';

        break;
      case 'PERSON':
        this.placeholder = 'thumbnail.person.placeholder';
        this.defaultImage = 'assets/images/person-placeholder.svg';
        this.thumbnailAlt = 'thumbnail.person.alt';

        break;
      case 'PUBLICATION':
        this.placeholder = 'thumbnail.publication.placeholder';
        this.defaultImage = 'assets/images/publication-placeholder.svg';
        this.thumbnailAlt = 'thumbnail.publication.alt';

        break;
      case 'PRODUCT':
        this.placeholder = 'thumbnail.product.placeholder';
        this.defaultImage = 'assets/images/product-placeholder.svg';
        this.thumbnailAlt = 'thumbnail.product.alt';

        break;
      case 'PATENT':
        this.placeholder = 'thumbnail.patent.placeholder';
        this.defaultImage = 'assets/images/patent-placeholder.svg';
        this.thumbnailAlt = 'thumbnail.patent.alt';

        break;
      default:
        this.placeholder = 'thumbnail.default.placeholder';
        this.defaultImage = 'assets/images/file-placeholder.svg';
        this.thumbnailAlt = 'thumbnail.default.alt';

        break;
    }

  }

  /**
   * Check if item has Third-party metrics blocked by consents
   */
  ngAfterViewInit() {
    if (this.showMetrics && this.klaroService) {
      this.klaroService.watchConsentUpdates();

      this.hasLoadedThirdPartyMetrics$ = combineLatest([
        this.klaroService.consentsUpdates$.pipe(
          filter(consents => isNotEmpty(consents))
        ),
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
