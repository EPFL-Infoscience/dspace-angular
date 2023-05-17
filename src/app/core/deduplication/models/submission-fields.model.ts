import { autoserialize, deserialize, inheritSerialization } from 'cerialize';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { HALLink } from '../../shared/hal-link.model';
import { typedObject } from '../../cache/builders/build-decorators';
import { SUBMISSION_FIELDS } from './submission-fields.resource-type';
import { DSpaceObject } from '../../shared/dspace-object.model';
import { CacheableObject } from '../../cache/cacheable-object.model';

/**
 * The interface representing the signature model
 */
@typedObject
@inheritSerialization(DSpaceObject)
export class SubmissionFieldsObject implements CacheableObject {
  /**
   * A string representing the kind of object, e.g. community, item, …
   */
  static type = SUBMISSION_FIELDS;

  @excludeFromEquals
  @autoserialize
  type: ResourceType = SUBMISSION_FIELDS;

  /**
   * The UUID of the item
   */
  @autoserialize
  itemId: string;

  /**
   * List of repeatable metdata fields
   */
  @autoserialize
  repeatableFields: string[];

  /**
   * Key Value Pair of nested metadata fields.
   * The key represeants the parent metadata field
   * and the value, the list of nested metdata fields
   */
  @autoserialize
  nestedFields: {[key: string]: string[]};

  /**
   * The links to all related resources returned by the rest api.
   */
  @deserialize
  _links: {
    self: HALLink,
  };
}
