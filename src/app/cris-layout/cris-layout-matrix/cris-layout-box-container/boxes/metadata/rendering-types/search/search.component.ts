import { Component, OnInit } from '@angular/core';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

/**
 * This component renders the search metadata fields
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[ds-search]',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.SEARCH)
export class SearchComponent extends RenderingTypeValueModelComponent implements OnInit {

  /**
   * the index to use to build the search query to be used in the link
   */
  index: string;

  /**
   * the query params to use to build the search query to be used in the link
   */
  searchQueryParams: any = {};

  ngOnInit(): void {
    let fieldArray = this.field.rendering.split('.');
    this.index = fieldArray[fieldArray.length - 1];
    if (this.renderingSubType !== 'default') {
      this.searchQueryParams.configuration = this.renderingSubType;
    }
    if (this.index === 'default') {
      this.searchQueryParams.query =  '"' + this.metadataValue.value + '"';
    } else if (this.index === 'auto') {
      this.searchQueryParams.query = this.field.metadata + ':"' + this.metadataValue.value + '"';
    } else {
      this.searchQueryParams.query = this.index + ':"' + this.metadataValue.value + '"';
    }
  }

}
