import { autoserialize, deserialize } from 'cerialize';

import { CacheableObject } from '../../cache/object-cache.reducer';
import { DEDUPLICATION_SET } from './deduplication-set.resource-type';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { HALLink } from '../../shared/hal-link.model';
import { typedObject } from '../../cache/builders/build-decorators';

/**
 * The interface representing the deduplication set model
 */
@typedObject
export class SetObject implements CacheableObject {
  /**
   * A string representing the kind of object, e.g. community, item, …
   */
  static type = DEDUPLICATION_SET;

  /**
   * The type of this ConfigObject
   */
  @excludeFromEquals
  type: ResourceType = DEDUPLICATION_SET;

  // TODO

  /**
   * The links to all related resources returned by the rest api.
   */
  @deserialize
  _links: {
    self: HALLink,
  };
}
