import { ResourceType } from '../../shared/resource-type';

/**
 * The resource type for MergeObject
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const MERGE_OBJECT = new ResourceType('merge');
