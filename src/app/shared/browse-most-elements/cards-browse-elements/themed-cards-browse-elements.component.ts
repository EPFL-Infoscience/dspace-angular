import {Component, Input} from '@angular/core';
import { ThemedComponent } from '../../theme-support/themed.component';
import { Context } from '../../../core/shared/context.model';
import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';
import { LayoutModeEnum, TopSection } from '../../../core/layout/models/section.model';
import {CardsBrowseElementsComponent} from './cards-browse-elements.component';

/**
 * This component is a wrapper for the CardsBrowseElementsComponent
 */
@Component({
  selector: 'ds-themed-cards-browse-elements',
  styleUrls: [],
  templateUrl: './../../theme-support/themed.component.html',
})
export class ThemedCardsBrowseElementsComponent extends ThemedComponent<CardsBrowseElementsComponent> {

  // AbstractBrowseElementsComponent I/O variables

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  @Input() topSection: TopSection;

  // CardsBrowseElementsComponent I/O variables

  @Input() projection: string;

  @Input() mode: LayoutModeEnum;

  @Input() showMetrics: boolean;

  @Input() showThumbnails: boolean;

  @Input() showLabel: boolean;

  protected inAndOutputNames: (keyof CardsBrowseElementsComponent & keyof this)[] = ['paginatedSearchOptions', 'context', 'showMetrics', 'showThumbnails', 'showLabel', 'projection', 'mode'];

  protected getComponentName(): string {
    return 'CardsBrowseElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`./../../../../themes/${themeName}/app/shared/browse-most-elements/cards-browse-elements/cards-browse-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./cards-browse-elements.component`);
  }
}
