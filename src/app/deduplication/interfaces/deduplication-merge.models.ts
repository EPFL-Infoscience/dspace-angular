import { Item } from './../../core/shared/item.model';

/**
 * The interface used for the model of the items data
 * and identifier color for the template
 */
export interface ItemData {
  object: Item;
  color: string;
}

/**
 * The interface used for the model of the metadata values
 */
export interface MetadataMapObject {
  value: string;
  items: ItemContainer[];
}

/**
 * The interface used for the model of the items to be merged
 */
export interface ItemContainer {
  itemId: string;
  metadataPlace: number;
  color: string;
  _link: string;
}

/**
 * The interface used for the model of the merged metadata fields
 */
export interface MergeItems {
  setId: string;
  bitstreams: string[];
  mergedItems: string[];
  metadata: ItemsMetadataField[];
}

/**
 * The interface used for the model of the metadata fields
 */
export interface ItemsMetadataField {
  metadataField: string;
  sources: ItemMetadataSource[];
}

/**
 * The interface used for the model of the metadata sources
 */
export interface ItemMetadataSource {
  item: string;
  place: number;
}

export interface SetIdentifiers {
  setId: string;
  signatureId: string;
}
