import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../core/shared/item.model';
import {
  SearchResultAdditionalMetadataEntityTypeConfig,
  SearchResultAdditionalMetadataFieldConfig
} from '../../../../../config/search-result-config.interface';
import { environment } from '../../../../../environments/environment';
import { MetadataLinkValue } from '../../../../cris-layout/models/cris-layout-metadata-link-value.model';
import { hasValue, isNotEmpty } from '../../../empty.util';
import { MetadataValue } from '../../../../core/shared/metadata.models';
import { ResolverStrategyService } from '../../../../cris-layout/services/resolver-strategy.service';

interface LinkData {
  href: string,
  text: string,
}

@Component({
  selector: 'ds-additional-metadata',
  templateUrl: './additional-metadata.component.html',
  styleUrls: ['./additional-metadata.component.scss']
})
export class AdditionalMetadataComponent implements OnInit {

  DEFAULT_CONFIG_NAME = 'default';

  @Input() item: Item;

  /**
   * A list of additional metadata fields to display
   */
  public additionalMetadataFields: SearchResultAdditionalMetadataFieldConfig[];

  constructor(
    protected resolver: ResolverStrategyService,
  ) {
  }

  ngOnInit(): void {

    const entityTypeConfig = environment.searchResult.additionalMetadataFields.filter(
      (field: SearchResultAdditionalMetadataEntityTypeConfig) => field.entityType.toLocaleLowerCase() === this.item.entityType.toLocaleLowerCase()
    );

    const defaultConfig = environment.searchResult.additionalMetadataFields.filter(
      (field: SearchResultAdditionalMetadataEntityTypeConfig) => field.entityType.toLocaleLowerCase() === this.DEFAULT_CONFIG_NAME
    );

    let unfilteredAdditionalMetadataFields: SearchResultAdditionalMetadataFieldConfig[];

    if (entityTypeConfig.length > 0) {
      unfilteredAdditionalMetadataFields = entityTypeConfig[0].metadataConfiguration;
    } else if (defaultConfig.length > 0) {
      unfilteredAdditionalMetadataFields = defaultConfig[0].metadataConfiguration;
    }

    this.additionalMetadataFields = unfilteredAdditionalMetadataFields.filter(
      (field) => this.item.hasMetadata(field.metadata)
    );

  }

  metadataRenderingType(metadata: SearchResultAdditionalMetadataFieldConfig): string {
    return metadata.rendering.split('.')[0];
  }

  metadataRenderingSubtype(metadata: SearchResultAdditionalMetadataFieldConfig): string {
    return metadata.rendering.split('.')[1];
  }

  linkData(configuration: SearchResultAdditionalMetadataFieldConfig, metadataValue: MetadataValue): LinkData {

    const renderingSubtype = this.metadataRenderingSubtype(configuration);
    let linkData = {} as LinkData;

    if (renderingSubtype?.toLocaleLowerCase() === 'email') {
      linkData.href = `mailto:${metadataValue.value}`;
      linkData.text = metadataValue.value;
    } else {
      const startsWithProtocol = [/^https?:\/\//, /^ftp:\/\//];
      linkData.href = startsWithProtocol.some(rx => rx.test(metadataValue.value)) ? metadataValue.value : `http://${metadataValue.value}`;
      linkData.text = metadataValue.value;
    }

    return linkData;
  }

  identifierData(configuration: SearchResultAdditionalMetadataFieldConfig, metadataValue: MetadataValue): LinkData {
    // TODO needs to be refactored (code from identifier.component.ts)
    const renderingSubtype = this.metadataRenderingSubtype(configuration);
    let linkData: LinkData;
    if (isNotEmpty(renderingSubtype)) {
      linkData = this.composeLink(metadataValue.value, renderingSubtype);
    } else {
      if (this.resolver.checkLink(metadataValue.value)) {
        linkData = {
          href: metadataValue.value,
          text: metadataValue.value
        };
      } else {
        for (const urn of this.resolver.managedUrn) {
          if (hasValue(metadataValue.value) && metadataValue.value.toLowerCase().startsWith(urn)) {
            linkData = this.composeLink(metadataValue.value, urn);
            break;
          }
        }
        if (!linkData) {
          linkData = {
            href: metadataValue.value,
            text: metadataValue.value
          };
        }
      }
    }
    return linkData;
  }

  composeLink(metadataValue: string, urn: string): MetadataLinkValue {
    // TODO needs to be refactored (code from identifier.component.ts)
    let value = metadataValue;
    const rep = urn + ':';
    if (metadataValue.startsWith(rep)) {
      value = metadataValue.replace(rep, '');
    }
    const href = this.resolver.getBaseUrl(urn) + value;
    const text = isNotEmpty(value) && value !== '' ? value : href;
    return {
      href,
      text
    };
  }

}
