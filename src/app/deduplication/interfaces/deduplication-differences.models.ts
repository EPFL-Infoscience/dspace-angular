import { MetadataValue } from './../../core/shared/metadata.models';
/**
 * The model of the item data
 */
export interface ItemData {
  id: string;    // item id
  text: string;  // the text to compare
  color: string; // identifier color of the item
}

/**
 * The model of items' metadata values
 */
export interface ItemsMetadataValues {
  itemId: string;
  value: MetadataValue;
  color: string;
}
