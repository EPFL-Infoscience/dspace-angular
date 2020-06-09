import { SignatureObject } from '../../core/deduplication/models/signature.model';
import {
  DeduplicationSignaturesActions,
  DeduplicationSignaturesActionTypes
} from './deduplication-signatures.actions';

/**
 * The interface representing the signatures state.
 */
export interface DeduplicationSignatureState {
  objects: SignatureObject[];
  processing: boolean;
  loaded: boolean;
  totalPages: number;
  currentPage: number;
  totalElements: number;
}

/**
 * Used for the signatures state initialization.
 */
const deduplicationSignatureInitialState: DeduplicationSignatureState = {
  objects: [],
  processing: false,
  loaded: false,
  totalPages: 0,
  currentPage: -1,
  totalElements: 0
};

/**
 * The deduplication signatures Reducer
 *
 * @param state
 *    the current state initialized with deduplicationSignatureInitialState
 * @param action
 *    the action to perform on the state
 * @return DeduplicationSigntureState
 *    the new state
 */
export function deduplicationSignatureReducer(state = deduplicationSignatureInitialState, action: DeduplicationSignaturesActions): DeduplicationSignatureState {
  switch (action.type) {
    case DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES: {
      return Object.assign({}, state, {
        processing: true
      });
    }

    case DeduplicationSignaturesActionTypes.ADD_SIGNATURES: {
      return Object.assign({}, state, {
        objects: state.objects.concat(action.payload.signatures),
        processing: false,
        loaded: true,
        totalPages: action.payload.totalPages,
        currentPage: state.currentPage + 1,
        totalElements: action.payload.totalElements
      });
    }

    case DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES_ERROR: {
      return Object.assign({}, state, {
        processing: false,
        loaded: true,
        currentPage: 0
      });
    }

    default: {
      return state;
    }
  }
}
