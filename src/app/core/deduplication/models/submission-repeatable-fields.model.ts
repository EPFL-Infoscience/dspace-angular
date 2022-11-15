import { autoserialize, deserialize, inheritSerialization } from 'cerialize';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { HALLink } from '../../shared/hal-link.model';
import { typedObject } from '../../cache/builders/build-decorators';
import { SUBMISSION_REPEATABLE_FIELDS } from './submission-repeatable-fields.resource-type';
import { DSpaceObject } from '../../shared/dspace-object.model';
import { CacheableObject } from '../../cache/cacheable-object.model';

/**
 * The interface representing the signature model
 */
@typedObject
@inheritSerialization(DSpaceObject)
export class SubmissionRepeatableFieldsObject implements CacheableObject {
  /**
   * A string representing the kind of object, e.g. community, item, …
   */
  static type = SUBMISSION_REPEATABLE_FIELDS;

  @excludeFromEquals
  @autoserialize
  type: ResourceType = SUBMISSION_REPEATABLE_FIELDS;

  @autoserialize
  itemId: string;

  @autoserialize
  repeatableFields: string[];
  /**
   * The links to all related resources returned by the rest api.
   */
  @deserialize
  _links: {
    self: HALLink,
  };
}
