import { Action } from '@ngrx/store';

import { type } from '../../shared/ngrx/type';
import { SignatureObject } from '../../core/deduplication/models/signature.model';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 *
 * The 'type' utility function coerces strings into string
 * literal types and runs a simple check to guarantee all
 * action types in the application are unique.
 */
export const DeduplicationSignaturesActionTypes = {
  ADD_SIGNATURES: type('dspace/core/deduplication/ADD_SIGNATURES'),
  RETRIEVE_ALL_SIGNATURES: type('dspace/core/deduplication/RETRIEVE_ALL_SIGNATURES'),
  RETRIEVE_ALL_SIGNATURES_ERROR: type('dspace/core/deduplication/RETRIEVE_ALL_SIGNATURES_ERROR'),
}

/* tslint:disable:max-classes-per-file */

/**
 * An ngrx action to init the deduplication signatures
 */
export class AddSignaturesAction implements Action {
  type = DeduplicationSignaturesActionTypes.ADD_SIGNATURES;
  payload: {
    signatures: SignatureObject[];
  };

  /**
   * Create a new InitWorkingplanAction
   *
   * @param signatures
   *    the list of Item of workpackages
   */
  constructor(signatures: SignatureObject[]) {
    this.payload = { signatures };
  }
}

/**
 * An ngrx action to retrieve all deduplication signatures.
 */
export class RetrieveAllSignaturesAction implements Action {
  type = DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES;
  payload: {
    elementsPerPage: number;
  };

  /**
   * Create a new InitWorkingplanAction
   *
   * @param signatures
   *    the list of Item of workpackages
   */
  constructor(elementsPerPage: number) {
    this.payload = { elementsPerPage };
  }
}

/**
 * An ngrx action for retrieving 'all deduplication signatures' error.
 */
export class RetrieveAllSignaturesErrorAction implements Action {
  type = DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES_ERROR;
}

/* tslint:enable:max-classes-per-file */

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types.
 */
export type DeduplicationSignaturesActions
  = AddSignaturesAction
  |RetrieveAllSignaturesAction
  |RetrieveAllSignaturesErrorAction;
