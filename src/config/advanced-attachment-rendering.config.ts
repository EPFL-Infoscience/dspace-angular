/**
 * Interface configuration to define the advanced attachment rendering settings
 */
import { AdditionalMetadataConfig } from './additional-metadata.config';

export interface AdvancedAttachmentRenderingConfig {
  pagination: AdvancedAttachmentRenderingPaginationConfig;
  metadata: AdditionalMetadataConfig[];
  attributes: AdvancedAttachmentRenderingAttributeConfig[];
}

/**
 * Interface configuration to define the pagination of the advanced attachment rendering
 */
export interface AdvancedAttachmentRenderingPaginationConfig {
  enabled: boolean;
  elementsPerPage: number;
}

/**
 * Interface configuration to define the additional attributes
 */
export interface AdvancedAttachmentRenderingAttributeConfig {
  name: string,
  label: string,
}
