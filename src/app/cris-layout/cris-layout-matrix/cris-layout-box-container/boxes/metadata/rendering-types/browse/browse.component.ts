import { Component, OnInit } from '@angular/core';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

/**
 * This component renders the browse metadata fields
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[ds-browse]',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.BROWSE)
export class BrowseComponent extends RenderingTypeValueModelComponent implements OnInit {
  /**
   * Type for rendering
   */
  metadataType: string;

  ngOnInit(): void {
    let fieldArray = this.field.metadata.split('.');
    this.metadataType = fieldArray[fieldArray.length - 1];
  }

}
