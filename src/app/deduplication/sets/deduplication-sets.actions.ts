import { Action } from '@ngrx/store';

import { type } from '../../shared/ngrx/type';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 *
 * The 'type' utility function coerces strings into string
 * literal types and runs a simple check to guarantee all
 * action types in the application are unique.
 */
export const DeduplicationSetsActionTypes = {
  RETRIEVE_SETS_BY_SIGNATURE: type('dspace/core/deduplication/RETRIEVE_SETS_BY_SIGNATURE'),
  RETRIEVE_SETS_BY_SIGNATURE_ERROR: type('dspace/core/deduplication/RETRIEVE_SETS_BY_SIGNATURE_ERROR'),
}

/* tslint:disable:max-classes-per-file */

/**
 * An ngrx action to retrieve all deduplication sets by signature.
 */
export class RetrieveSetsBySignatureAction implements Action {
  type = DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE;
}

/**
 * An ngrx action for retrieving 'all deduplication sets' error.
 */
export class RetrieveSetsBySignatureErrorAction implements Action {
  type = DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE_ERROR;
}

/* tslint:enable:max-classes-per-file */

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types.
 */
export type DeduplicationSetsActions
  = RetrieveSetsBySignatureAction
  |RetrieveSetsBySignatureErrorAction;
