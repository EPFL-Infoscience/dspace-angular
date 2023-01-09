import { ItemsMetadataField } from './../../../deduplication/interfaces/deduplication-merge.models';
import { Item } from './../../shared/item.model';
import { MERGE_OBJECT } from './merge-object.resource-type';
import { autoserialize } from 'cerialize';

import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { typedObject } from '../../cache/builders/build-decorators';
import { HALLink } from '../../shared/hal-link.model';
import { CacheableObject } from '../../cache/cacheable-object.model';

/**
 * The interface representing the merge model
 */
@typedObject
export class MergeObject implements CacheableObject {
  /**
   * A string representing the kind of object, e.g. community, item, …
   */
  static type = MERGE_OBJECT;

  /**
   * The type of this ConfigObject
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The target item link
   */
  @autoserialize
  // targetItem: string;

  /**
   * The merged items self's links
   */
  @autoserialize
  mergedItems: string[];

  /**
   * The merged items bitstreams self's links
   */
  @autoserialize
  bitstreams: string[];

  @autoserialize
  metadata: ItemsMetadataField[];

  /**
   * The embedded metadata values.
   */
  @autoserialize
  _embedded: {
    item: Item;
  };

  @autoserialize
  setId?: string;

  uuid?: string;

  handle?: string;

  _links: { self: HALLink };
}
