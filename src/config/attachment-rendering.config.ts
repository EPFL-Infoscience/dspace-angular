/**
 * Interface configuration to show/hide advnaced attachment informations
 */
export interface AttachmentRenderingConfig {
  pagination: AttachmentRenderingPaginationConfig;
  showViewerOnSameItemPage: boolean;
}

export interface AttachmentRenderingPaginationConfig {
  enabled: boolean;
  elementsPerPage: number;
}
