import { ResourceType } from '../../shared/resource-type';

/**
 * The resource type for DeduplicationSetItems
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const DEDUPLICATION_SET_ITEMS = new ResourceType('items');
