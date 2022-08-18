import { Config } from './config.interface';

export interface SearchResultConfig extends Config {
  additionalMetadataFields: AdditionalMetadataConfig[],
}

export interface AdditionalMetadataConfig extends Config {
  metadata: string,
  rendering: string,
  itemType: string,
  label?: string,
}
