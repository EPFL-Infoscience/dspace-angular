import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../../core/shared/item.model';
import { Chips } from '../../../../../../../shared/chips/models/chips.model';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { RenderingTypeStructuredModelComponent } from '../rendering-type-structured.model';

/**
 * This component renders the tag search metadata fields
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[ds-tag-search]',
  templateUrl: './tag-search.component.html',
  styleUrls: ['./tag-search.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.TAGSEARCH, true)
export class TagSearchComponent extends RenderingTypeStructuredModelComponent implements OnInit {
  /**
   * the index to use to build the search query to be used in the link
   */
  index: string;

  /**
   * This is the chips component which will be rendered in the template
   */
  public chips: Chips;

  searchLinkHref = '/search?';

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    protected translateService: TranslateService
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, translateService);
  }

  ngOnInit(): void {
    let fieldArray = this.field.rendering.split('.');
    this.index = fieldArray[fieldArray.length - 1];
    if (this.renderingSubType !== 'default') {
      this.searchLinkHref += 'configuration=' + this.renderingSubType + '&';
    }
    if (this.index === 'default') {
      this.searchLinkHref += 'query="';
    } else if (this.index === 'auto') {
      this.searchLinkHref += 'query=' + this.field.metadata + ':"';
    } else {
      this.searchLinkHref += 'query=' + this.index + ':"';
    }

    if ( this.indexToBeRendered > 0 ) {
      this.initChips([this.metadataValues[this.indexToBeRendered]]);
    } else {
      this.initChips(this.metadataValues);
    }
  }

  /**
   * Creates the chips component with the required values
   * @params initChipsValues values to be rendered in chip items
   */
  private initChips(initChipsValues: any[]): void {
    initChipsValues.forEach((element, ind) => {
      const el = element;
      initChipsValues[ind] = {
        value: el,
        href: this.searchLinkHref + el + '"'
      };
    });
    this.chips = new Chips(initChipsValues,'value');
  }

}
