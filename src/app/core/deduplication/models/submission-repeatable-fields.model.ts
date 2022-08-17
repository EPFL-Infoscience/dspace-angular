import { autoserialize, deserialize } from 'cerialize';
import { CacheableObject } from '../../cache/object-cache.reducer';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { HALLink } from '../../shared/hal-link.model';
import { typedObject } from '../../cache/builders/build-decorators';
import { SUBMISSION_REPEATABLE_FIELDS } from './submission-repeatable-fields.resource-type';

/**
 * The interface representing the signature model
 */
@typedObject
export class SubmissionRepeatableFieldsObject implements CacheableObject {
  /**
   * A string representing the kind of object, e.g. community, item, …
   */
  static type = SUBMISSION_REPEATABLE_FIELDS;

  @excludeFromEquals
  @autoserialize
  type: ResourceType;

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
