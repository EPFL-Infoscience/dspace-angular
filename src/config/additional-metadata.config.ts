import { Config } from './config.interface';

export interface AdditionalMetadataConfig extends Config {
  name: string,
  rendering: string,
  label?: string,
}
