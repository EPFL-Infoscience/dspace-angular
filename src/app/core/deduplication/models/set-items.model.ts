import { autoserialize, autoserializeAs, deserialize } from 'cerialize';
import { CacheableObject } from '../../cache/object-cache.reducer';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { HALLink } from '../../shared/hal-link.model';
import { typedObject } from '../../cache/builders/build-decorators';
import { DEDUPLICATION_SET_ITEMS } from './deduplication-set-items.resource-type';
import { MetadataMap } from '../../shared/metadata.models';

/**
 * The interface representing the deduplication set model
 */
@typedObject
export class SetItemsObject implements CacheableObject {
  /**
   * A string representing the kind of object, e.g. community, item, …
   */
  static type = DEDUPLICATION_SET_ITEMS;

  /**
   * The type of this ConfigObject
   */
  @excludeFromEquals
  type: ResourceType;

  @autoserialize
  id: string;

  @autoserialize
  uuid: string;

  @autoserialize
  name: string;

  @autoserialize
  handle: string;

  @autoserializeAs(Boolean, 'inArchive')
  isArchived: boolean;

  @autoserializeAs(Boolean, 'discoverable')
  isDiscoverable: boolean;

  @autoserializeAs(Boolean, 'withdrawn')
  isWithdrawn: boolean;

  @autoserialize
  entityType: string;

  @autoserialize
  lastModified: Date;

  @autoserialize
  metadata: MetadataMap;

  /**
   * The links to all related resources returned by the rest api.
   */
  @deserialize
  _links: {
    self: HALLink,
    owningCollection: HALLink,
  };
}
