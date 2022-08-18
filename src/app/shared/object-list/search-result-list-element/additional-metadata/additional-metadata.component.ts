import {Component, Input, OnInit} from '@angular/core';
import {Item} from '../../../../core/shared/item.model';
import {AdditionalMetadataConfig} from '../../../../../config/search-result-config.interface';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'ds-additional-metadata',
  templateUrl: './additional-metadata.component.html',
  styleUrls: ['./additional-metadata.component.scss']
})
export class AdditionalMetadataComponent implements OnInit {

  @Input() item: Item;

  /**
   * A list of additional metadata fields to display
   */
  public additionalMetadataFields: AdditionalMetadataConfig[];

  ngOnInit(): void {

    this.additionalMetadataFields = environment.searchResult.additionalMetadataFields.filter(
      (field) => field.itemType.toLocaleLowerCase() ===
        this.item.entityType.toLocaleLowerCase() &&
        this.item.hasMetadata(field.metadata)
    );

  }

}
