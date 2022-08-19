import { Config } from './config.interface';

export interface SearchResultConfig extends Config {
  additionalMetadataFields: SearchResultAdditionalMetadataEntityTypeConfig[],
}

export interface SearchResultAdditionalMetadataEntityTypeConfig extends Config {
  entityType: string,
  metadataConfiguration: SearchResultAdditionalMetadataFieldConfig[],
}

export interface SearchResultAdditionalMetadataFieldConfig extends Config {
  metadata: string,
  rendering: string,
  label?: string,
}
