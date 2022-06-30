import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { CrisLayoutLoaderDirective } from './directives/cris-layout-loader.directive';
import { CrisLayoutComponent } from './cris-layout.component';
import { CrisLayoutLeadingComponent } from './cris-layout-leading/cris-layout-leading.component';
import { CrisLayoutLoaderComponent } from './cris-layout-loader/cris-layout-loader.component';
import { CrisLayoutMatrixComponent } from './cris-layout-matrix/cris-layout-matrix.component';
import { CrisLayoutVerticalComponent } from './cris-layout-loader/cris-layout-vertical/cris-layout-vertical.component';
import { CrisLayoutSidebarComponent } from './cris-layout-loader/cris-layout-vertical/cris-layout-sidebar/cris-layout-sidebar.component';
import { CrisLayoutHorizontalComponent } from './cris-layout-loader/cris-layout-horizontal/cris-layout-horizontal.component';
import { CrisLayoutNavbarComponent } from './cris-layout-loader/cris-layout-horizontal/cris-layout-navbar/cris-layout-navbar.component';
import { CrisLayoutSidebarItemComponent } from './cris-layout-loader/shared/sidebar-item/cris-layout-sidebar-item.component';
import { CrisLayoutBoxContainerComponent } from './cris-layout-matrix/cris-layout-box-container/cris-layout-box-container.component';
import { RowComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/row/row.component';
import { CrisLayoutMetadataBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/cris-layout-metadata-box.component';
import { TextComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/text/text.component';
import { HeadingComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/heading/heading.component';
import { CrisLayoutRelationBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/relation/cris-layout-relation-box.component';
import { MyDSpacePageModule } from '../my-dspace-page/my-dspace-page.module';
import { LongtextComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/longtext/longtext.component';
import { DateComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/date/date.component';
import { DsDatePipe } from './pipes/ds-date.pipe';
import { LinkComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/link/link.component';
import { IdentifierComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/identifier/identifier.component';
import { CrisrefComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/crisref/crisref.component';
import { ThumbnailComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/thumbnail/thumbnail.component';
import { AttachmentComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/attachment/attachment.component';
import { OrcidSyncQueueComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/orcid-sync-queue/orcid-sync-queue.component';
import { OrcidAuthorizationsComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/orcid-authorizations/orcid-authorizations.component';
import { OrcidSyncSettingsComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/orcid-sync-settings/orcid-sync-settings.component';
import { CrisLayoutMetricsBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metrics/cris-layout-metrics-box.component';
import { CrisLayoutIIIFViewerBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/iiif-viewer/cris-layout-iiif-viewer-box.component';
import { CrisLayoutIIIFToolbarBoxComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/iiif-toolbar/cris-layout-iiif-toolbar-box.component';
import { MetricRowComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metrics/metric-row/metric-row.component';
import { ContextMenuModule } from '../shared/context-menu/context-menu.module';
import { TableComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/metadataGroup/table/table.component';
import { InlineComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/metadataGroup/inline/inline.component';
import { OrcidComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/orcid/orcid.component';
import { ValuepairComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/valuepair/valuepair.component';
import { TagComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/tag/tag.component';
import { MetadataContainerComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/row/metadata-container/metadata-container.component';
import { MetadataRenderComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/row/metadata-container/metadata-render/metadata-render.component';
import { MapComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/map/map.component';
import { GooglemapsModule } from '../shared/googlemaps/googlemaps.module';
import { LoadMoreService } from './services/load-more.service';
import { MiradorViewerModule } from '../item-page/mirador-viewer/mirador-viewer.module';
import { ComcolModule } from '../shared/comcol/comcol.module';
import { SearchModule } from '../shared/search/search.module';
import { HtmlComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/html/html.component';
import { BrowseComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/browse/browse.component';
import { TagBrowseComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/tag-browse/tag-browse.component';
import { MarkdownComponent } from './cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/markdown/markdown.component';
import { DsMarkdownViewerModule } from '../shared/markdown-viewer/ds-markdown-viewer.module';

const ENTRY_COMPONENTS = [
  // put only entry components that use custom decorator
  CrisLayoutVerticalComponent,
  CrisLayoutHorizontalComponent,
  CrisLayoutMetadataBoxComponent,
  TextComponent,
  HtmlComponent,
  HeadingComponent,
  CrisLayoutRelationBoxComponent,
  CrisLayoutIIIFViewerBoxComponent,
  CrisLayoutIIIFToolbarBoxComponent,
  LongtextComponent,
  DateComponent,
  LinkComponent,
  IdentifierComponent,
  CrisrefComponent,
  ThumbnailComponent,
  AttachmentComponent,
  OrcidSyncQueueComponent,
  OrcidAuthorizationsComponent,
  OrcidSyncSettingsComponent,
  CrisLayoutMetricsBoxComponent,
  TableComponent,
  InlineComponent,
  OrcidComponent,
  ValuepairComponent,
  TagComponent,
  MapComponent,
  BrowseComponent,
  TagBrowseComponent,
  MarkdownComponent
];
@NgModule({
  declarations: [
    ...ENTRY_COMPONENTS,
    CrisLayoutLoaderDirective,
    CrisLayoutComponent,
    CrisLayoutLeadingComponent,
    CrisLayoutLoaderComponent,
    CrisLayoutMatrixComponent,
    CrisLayoutSidebarComponent,
    CrisLayoutNavbarComponent,
    CrisLayoutSidebarItemComponent,
    CrisLayoutBoxContainerComponent,
    MetricRowComponent,
    TableComponent,
    InlineComponent,
    OrcidComponent,
    ValuepairComponent,
    TagComponent,
    DsDatePipe,
    RowComponent,
    MetadataContainerComponent,
    MetadataRenderComponent,
    MarkdownComponent
  ],
  providers:[ LoadMoreService ],
  imports: [
    CommonModule,
    SharedModule,
    SearchModule.withEntryComponents(),
    GooglemapsModule,
    MyDSpacePageModule,
    ContextMenuModule.withEntryComponents(),
    NgbAccordionModule,
    ComcolModule,
    MiradorViewerModule,
    DsMarkdownViewerModule
  ],
  exports: [
    CrisLayoutComponent,
  ]
})
export class CrisLayoutModule {
  /**
   * NOTE: this method allows to resolve issue with components that using a custom decorator
   * which are not loaded during CSR otherwise
   */
  static withEntryComponents() {
    return {
      ngModule: CrisLayoutModule,
      providers: ENTRY_COMPONENTS.map((component) => ({ provide: component }))
    };
  }
}
