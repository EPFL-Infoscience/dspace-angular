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
  nestedMetadataValues?: NestedMetadataObject[];
  items: ItemContainer[];
}

export interface NestedMetadataObject extends MetadataMapObject {
  nestedMetadataKey: string;
}

/**
 * The interface used for the model of the items to be merged
 */
export interface ItemContainer {
  itemId: string;
  itemHandle: string;
  metadataPlace: number;
  color: string;
  _link: string;
}

/**
 * The interface used for the model of the merged metadata fields
 */
export interface MergeSetItems extends MergeItemsFromCompare {
  setId: string;
}

export interface MergeItemsFromCompare {
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
  rule: string;
}

export enum NestedMetadataFields {
  AuthorAffiliation = 'oairecerif.author.affiliation',
  Author = 'dc.contributor.author',

  Editor = 'dc.contributor.editor',
  EditorAffiliation = 'oairecerif.editor.affiliation',
}

export const MetadataKeysWithNestedFields = new Map<string, string>([
  [NestedMetadataFields.Author, NestedMetadataFields.AuthorAffiliation],
  [NestedMetadataFields.Editor, NestedMetadataFields.EditorAffiliation],
]);
