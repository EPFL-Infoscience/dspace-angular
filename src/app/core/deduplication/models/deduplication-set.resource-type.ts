import { ResourceType } from '../../shared/resource-type';

/**
 * The resource type for DeduplicationSet
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const DEDUPLICATION_SET = new ResourceType('set');
