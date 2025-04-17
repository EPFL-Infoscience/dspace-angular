import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopSectionComponent } from './section-component/top-section/top-section.component';
import { ThemedTopSectionComponent } from './section-component/top-section/themed-top-section.component';
import { BrowseSectionComponent } from './section-component/browse-section/browse-section.component';
import { ThemedBrowseSectionComponent } from './section-component/browse-section/themed-browse-section.component';
import { CountersSectionComponent } from './section-component/counters-section/counters-section.component';
import { ThemedCountersSectionComponent } from './section-component/counters-section/themed-counters-section.component';
import { FacetSectionComponent } from './section-component/facet-section/facet-section.component';
import { ThemedFacetSectionComponent } from './section-component/facet-section/themed-facet-section.component';
import {
  MultiColumnTopSectionComponent
} from './section-component/multi-column-top-section/multi-column-top-section.component';
import {
  ThemedMultiColumnTopSectionComponent
} from './section-component/multi-column-top-section/themed-multi-column-top-section.component';
import { SearchSectionComponent } from './section-component/search-section/search-section.component';
import { ThemedSearchSectionComponent } from './section-component/search-section/themed-search-section.component';
import { TextSectionComponent } from './section-component/text-section/text-section.component';
import { ThemedTextSectionComponent } from './section-component/text-section/themed-text-section.component';
import { SharedModule } from '../shared.module';
import { MarkdownViewerModule } from '../markdown-viewer/markdown-viewer.module';
import { CarouselSectionComponent } from './section-component/carousel-section/carousel-section.component';
import { ThemedCarouselSectionComponent } from './section-component/carousel-section/themed-carousel-section.component';
import { CarouselModule } from '../carousel/carousel.module';
import { GridSectionComponent } from './section-component/grid-section/grid-section.component';
import { ThemedGridSectionComponent } from './section-component/grid-section/themed-grid-section.component';
import { TwitterSectionComponent } from './section-component/twitter-section/twitter-section.component';
import { ThemedTwitterSectionComponent } from './section-component/twitter-section/themed-twitter-section.component';
import { BrowserOnlyDirective } from '../utils/browser-only.directive';

const COMPONENTS = [
  BrowseSectionComponent,
  ThemedBrowseSectionComponent,
  CountersSectionComponent,
  ThemedCountersSectionComponent,
  FacetSectionComponent,
  ThemedFacetSectionComponent,
  MultiColumnTopSectionComponent,
  ThemedMultiColumnTopSectionComponent,
  SearchSectionComponent,
  ThemedSearchSectionComponent,
  TextSectionComponent,
  ThemedTextSectionComponent,
  TopSectionComponent,
  ThemedTopSectionComponent,
  CarouselSectionComponent,
  ThemedCarouselSectionComponent,
  GridSectionComponent,
  ThemedGridSectionComponent,
  TwitterSectionComponent,
  ThemedTwitterSectionComponent
];

@NgModule({
  declarations: [
    ...COMPONENTS
  ],
    imports: [
        CommonModule,
        SharedModule,
        MarkdownViewerModule,
        CarouselModule,
        MarkdownViewerModule,
        BrowserOnlyDirective
    ],
  exports: [
    ...COMPONENTS
  ]
})
export class ExploreModule {
}
