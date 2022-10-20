import { Action } from '@ngrx/store';
import { SetObject } from './../../core/deduplication/models/set.model';

import { type } from '../../shared/ngrx/type';
import { Item } from '../../core/shared/item.model';

/* tslint:disable:max-classes-per-file */

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
  ADD_SETS: type('dspace/core/deduplication/ADD_SETS'),
  REMOVE_SETS: type('dspace/core/deduplication/REMOVE_SETS'),
  RETRIEVE_SETS_BY_SIGNATURE_ERROR: type('dspace/core/deduplication/RETRIEVE_SETS_BY_SIGNATURE_ERROR'),
  RETRIEVE_ALL_SET_ITEMS: type('dspace/core/deduplication/RETRIEVE_ALL_SET_ITEMS'),
  ADD_SET_ITEMS: type('dspace/core/deduplication/ADD_SET_ITEMS'),
  RETRIEVE_ALL_SET_ITEMS_ERROR: type('dspace/core/deduplication/RETRIEVE_ALL_SET_ITEMS_ERROR'),
  DELETE_SET: type('dspace/core/deduplication/DELETE_SET'),
  DELETE_SET_ERROR: type('dspace/core/deduplication/DELETE_SET_ERROR'),
  DELETE_ITEM: type('dspace/core/deduplication/DELETE_ITEM'),
  REMOVE_ALL_ITEMS: type('dspace/core/deduplication/REMOVE_ALL_ITEMS'),
  ADD_ITEMS_TO_COMPARE: type('dspace/core/deduplication/ADD_ITEMS_TO_COMPARE'),
  RETRIEVE_ITEMS_TO_COMPARE: type('dspace/core/deduplication/RETRIEVE_ITEMS_TO_COMPARE'),
  DELETE_ITEMS_TO_COMPARE: type('dspace/core/deduplication/DELETE_ITEMS_TO_COMPARE'),
};

//#region Sets

/**
 * An ngrx action to retrieve all deduplication sets by signature.
 */
export class RetrieveSetsBySignatureAction implements Action {
  type = DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE;

  payload: {
    elementsPerPage: number;
    signatureId: string;
    rule: string;
  };

  /**
   * Create a new RetrieveAllSignaturesAction.
   *
   * @param elementsPerPage
   *    the number of signatures per page
   */
  constructor(elementsPerPage: number, signatureId: string, rule: string) {
    this.payload = { elementsPerPage, signatureId, rule };
  }
}

/**
 * An ngrx action for retrieving 'all deduplication sets' error.
 */
export class RetrieveSetsBySignatureErrorAction implements Action {
  type = DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE_ERROR;
}

/**
 * An ngrx action to load the deduplication sets objects.
 * Called by the RetrieveAllSetsAction effect.
 */
export class AddSetsAction implements Action {
  type = DeduplicationSetsActionTypes.ADD_SETS;
  payload: {
    objects: SetObject[];
    totalPages: number;
    currentPage: number;
    totalElements: number;
    signatureId: string;
    rule: string;
  };

  /**
   * Creates an instance of AddSetsAction.
   * @param {SetObject[]} objects - the list of sets
   * @param {number} totalPages
   * @param {number} currentPage
   * @param {number} totalElements
   * @param {string} signatureId - the signature id of the sets
   * @param {string} rule - the rule of the sets
   */
  constructor(objects: SetObject[], totalPages: number, currentPage: number, totalElements: number, signatureId: string, rule: string) {
    this.payload = {
      objects,
      totalPages,
      currentPage,
      totalElements,
      signatureId,
      rule
    };
  }
}
//#endregion Sets

//#region Set Items
export class RetrieveSetItemsAction implements Action {
  type = DeduplicationSetsActionTypes.RETRIEVE_ALL_SET_ITEMS;

  payload: {
    setId: string;
  };

  /**
   * Creates an instance of RetrieveSetItemsAction.
   * @param {string} setId
   * @memberof RetrieveSetItemsAction
   */
  constructor(setId: string) {
    this.payload = { setId };
  }
}

export class RemoveSetsAction implements Action {
  type = DeduplicationSetsActionTypes.REMOVE_SETS;

  payload: {
    signatureId: string;
    rule: string;
  };

  /**
   * Creates an instance of RetrieveSetItemsAction.
   * @param {string} setId
   * @memberof RetrieveSetItemsAction
   */
  constructor(signatureId: string,
    rule: string) {
    this.payload = {
      signatureId,
      rule
    };
  }
}

/**
 * An ngrx action to load the deduplication set items objects.
 * Called by the RetrieveAllSetItemsAction effect.
 */
export class AddSetItemsAction implements Action {
  type = DeduplicationSetsActionTypes.ADD_SET_ITEMS;
  payload: {
    objects: Item[];
    setId: string;
  };

  /**
   * Creates an instance of AddSetItemsAction.
   * @param objects - the list of set items
   * @param setId - the id of the set items
   */
  constructor(objects: Item[], setId: string) {
    this.payload = {
      objects,
      setId,
    };
  }
}

/**
 * An ngrx action for retrieving deduplication set items' error.
 */
export class RetrieveSetItemsErrorAction implements Action {
  type = DeduplicationSetsActionTypes.RETRIEVE_ALL_SET_ITEMS_ERROR;
}

/**
 * An ngrx action to delete a deduplication set.
 */
export class DeleteSetAction implements Action {
  type = DeduplicationSetsActionTypes.DELETE_SET;
  payload: {
    signatureId: string;
    setId: string;
    rule: string;
  };

  /**
   * Creates an instance of DeleteSetAction.
   * @param signatureId - the signature id of the set
   * @param setId - the id of the set
   */
  constructor(signatureId: string, setId: string, rule: string) {
    this.payload = { signatureId, setId, rule };
  }
}

/**
 * An ngrx action to delete a deduplication set error.
 * @export
 * @class DeleteItemAction
 * @implements {Action}
 */
export class DeleteItemAction implements Action {
  type = DeduplicationSetsActionTypes.DELETE_ITEM;
  payload: {
    signatureId: string;
    itemId: string;
    setId: string;
  };

  /**
   * Creates an instance of DeleteItemAction.
   * @param signatureId - the signature id of the set
   * @param itemId - the id of the item
   */
  constructor(signatureId: string, itemId: string, setId: string) {
    this.payload = { signatureId, itemId, setId };
  }
}

export class RetrieveItemsToCompareAction implements Action {
  type = DeduplicationSetsActionTypes.RETRIEVE_ITEMS_TO_COMPARE;

  payload: {
    objects: Item[];
  };

  /**
   * Creates an instance of RetrieveSetItemsAction.
   * @param {string} setId
   * @memberof RetrieveSetItemsAction
   */
  constructor(objects: Item[]) {
    this.payload = { objects };
  }
}

export class AddItemsToCompareAction implements Action {
  type = DeduplicationSetsActionTypes.ADD_ITEMS_TO_COMPARE;
  payload: {
    objects: string[];
  };

  /**
   * Creates an instance of AddSetItemsAction.
   * @param objects - the list of set items
   * @param setId - the id of the set items
   */
  constructor(objects: string[]) {
    this.payload = {
      objects,
    };
  }
}

export class DeleteItemsToCompareAction implements Action {
  type = DeduplicationSetsActionTypes.DELETE_ITEMS_TO_COMPARE;
}

export class RemoveAllItemsAction implements Action {
  type = DeduplicationSetsActionTypes.REMOVE_ALL_ITEMS;
  constructor() { }
}
//#endregion Set Items

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types.
 */
export type DeduplicationSetsActions
  = RetrieveSetsBySignatureAction
  | AddSetsAction
  | RetrieveSetsBySignatureErrorAction
  | RetrieveSetItemsAction
  | AddSetItemsAction
  | RetrieveSetItemsErrorAction
  | DeleteSetAction
  | DeleteItemAction
  | RetrieveItemsToCompareAction
  | AddItemsToCompareAction
  | DeleteItemsToCompareAction
  | RemoveSetsAction
  | RemoveAllItemsAction;
