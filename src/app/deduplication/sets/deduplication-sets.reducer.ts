import { SetObject } from '../../core/deduplication/models/set.model';
import {
  DeduplicationSetsActionTypes,
  DeduplicationSetsActions,
} from './deduplication-sets.actions';

export interface DeduplicationSetState {
  sets: SetObject[];
  processing: boolean;
  loaded: boolean;
  totalPages: number;
  currentPage: number;
  totalElements: number;
  signatureId: string;
}

const deduplicationObjectInitialState: DeduplicationSetState = {
  sets: [],
  processing: false,
  loaded: false,
  totalPages: 0,
  currentPage: 0,
  totalElements: 0,
  signatureId: null
};

/**
 * The deduplication sets Reducer
 *
 * @param state
 *    the current state
 * @param action
 *    the action to perform on the state
 * @return DeduplicationSetState
 *    the new state
 */
export function deduplicationSetReducer(state = deduplicationObjectInitialState, action: DeduplicationSetsActions): DeduplicationSetState {
  console.log(action.type,'action.type');
  switch (action.type) {

    /*case DeduplicationObjectsActionTypes.RETRIEVE_ALL_SIGNATURES: {
      return Object.assign({}, deduplicationObjectInitialState, {
        processing: true
      });
    }*/

    case DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE: {
      return Object.assign({}, state, {
        processing: true
      });
    }

    case DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE_ERROR: {
      return Object.assign({}, state, {
        processing: false,
        loaded: true,
        currentPage: 0
      });
    }

    case DeduplicationSetsActionTypes.ADD_SETS: {
      return Object.assign({}, state, {
        objects: state.sets.concat(action.payload.sets),
        processing: false,
        loaded: true,
        totalPages: action.payload.totalPages,
        currentPage: state.currentPage + 1,
        totalElements: action.payload.totalElements,
        signatureId: action.payload.signatureId
      });
    }

    default: {
      return state;
    }
  }
}
