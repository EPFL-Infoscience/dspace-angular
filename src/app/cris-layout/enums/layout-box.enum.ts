/**
 * This enum contains the boxes types
 * It is used to determine which component to use for render a specific box.
 * To overwrite a box its boxType must be entered as a value.
 */
export enum LayoutBox {
  METADATA = 'METADATA',
  METRICS = 'METRICS',
  HIERARCHY = 'HIERARCHY',
  SEARCH = 'SEARCH',
  RELATION = 'RELATION',
  ORCID_SYNC_SETTINGS = 'ORCID_SYNC_SETTINGS',
  ORCID_AUTHORIZATIONS = 'ORCID_AUTHORIZATIONS',
  ORCID_SYNC_QUEUE = 'ORCID_SYNC_QUEUE',
  IIIFVIEWER = 'IIIFVIEWER',
  IIIFTOOLBAR = 'IIIFTOOLBAR',
  VIDEOVIEWER = 'VIDEOVIEWER',
  COLLECTIONS = 'COLLECTIONS',
  VERSIONING = 'VERSIONING',
}
