import { ResourceType } from '../../shared/resource-type';

/**
 * The resource type for SignatureObject
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const SIGNATURE_OBJECT = new ResourceType('signature');
