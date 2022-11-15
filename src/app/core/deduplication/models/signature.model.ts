import { autoserialize, deserialize } from 'cerialize';

import { SIGNATURE_OBJECT } from './signature-object.resource-type';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { ResourceType } from '../../shared/resource-type';
import { HALLink } from '../../shared/hal-link.model';
import { typedObject } from '../../cache/builders/build-decorators';
import { CacheableObject } from '../../cache/cacheable-object.model';

/**
 * The interface representing the signature model
 */
@typedObject
export class SignatureObject implements CacheableObject {
  /**
   * A string representing the kind of object, e.g. community, item, …
   */
  static type = SIGNATURE_OBJECT;

  /**
   * The type of this ConfigObject
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The deduplication signature id
   */
  @autoserialize
  id: string;

  /**
   * The deduplication signature type
   */
  @autoserialize
  signatureType: string;

  /**
   * The total number of deduplication group, found by DSpace, not yet verified by a reviewer
   */
  @autoserialize
  groupReviewerCheck: number;

  /**
   * The total number of deduplication group, found by DSpace, not yet verified by a submitter
   */
  @autoserialize
  groupSubmitterCheck: number;

  /**
   * The total number of deduplication group, found by DSpace, not yet verified by an administrator
   */
  @autoserialize
  groupAdminstratorCheck: number;

  /**
   * The links to all related resources returned by the rest api.
   */
  @deserialize
  _links: {
    self: HALLink,
  };
}
