import { ResourceType } from '../../shared/resource-type';

/**
 * The resource type for SubmissionRepeatableFieldsObject
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const SUBMISSION_FIELDS = new ResourceType('submissionfield');
