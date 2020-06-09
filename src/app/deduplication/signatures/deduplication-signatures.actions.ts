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
  ADD_SIGNATURES: type('dspace/deduplication/ADD_SIGNATURES'),
  RETRIEVE_ALL_SIGNATURES: type('dspace/deduplication/RETRIEVE_ALL_SIGNATURES'),
  RETRIEVE_ALL_SIGNATURES_ERROR: type('dspace/deduplication/RETRIEVE_ALL_SIGNATURES_ERROR'),
}

/* tslint:disable:max-classes-per-file */

/**
 * An ngrx action to retrieve all deduplication signatures.
 */
export class RetrieveAllSignaturesAction implements Action {
  type = DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES;
  payload: {
    elementsPerPage: number;
  };

  /**
   * Create a new RetrieveAllSignaturesAction.
   *
   * @param elementsPerPage
   *    the number of signatures per page
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

/**
 * An ngrx action to load the deduplication signatures objects.
 * Called by the RetrieveAllSignaturesAction effect.
 */
export class AddSignaturesAction implements Action {
  type = DeduplicationSignaturesActionTypes.ADD_SIGNATURES;
  payload: {
    signatures: SignatureObject[];
    totalPages: number;
    currentPage: number;
    totalElements: number;
  };

  /**
   * Create a new AddSignaturesAction.
   *
   * @param signatures
   *    the list of signtures
   * @param totalPages
   *    the total available pages of signatures
   * @param currentPage
   *    the current page
   * @param totalElements
   *    the total available deduplication signatures
   */
  constructor(signatures: SignatureObject[], totalPages: number, currentPage: number, totalElements: number) {
    this.payload = {
      signatures,
      totalPages,
      currentPage,
      totalElements
    };
  }
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
