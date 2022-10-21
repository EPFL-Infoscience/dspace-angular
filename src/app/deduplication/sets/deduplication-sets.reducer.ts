import { isEqual } from 'lodash';

import { hasValue } from './../../shared/empty.util';
import { SetObject } from '../../core/deduplication/models/set.model';
import {
  DeduplicationSetsActionTypes,
  DeduplicationSetsActions,
  DeleteSetAction,
} from './deduplication-sets.actions';

/**
 * The interface representing the set items state.
 * @interface DeduplicationSetState
 */
export interface DeduplicationSetState {
  objects: SetObject[];
  processing: boolean;
  loaded: boolean;
  totalPages: number;
  currentPage: number;
  totalElements: number;
  signatureId: string;
  rule: string;
}

/**
 * Used for the set state initialization.
 */
const deduplicationObjectInitialState: DeduplicationSetState = {
  objects: [],
  processing: false,
  loaded: false,
  totalPages: 0,
  currentPage: 0,
  totalElements: 0,
  signatureId: null,
  rule: null
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
  switch (action.type) {

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
        objects: state.objects.concat(action.payload.objects),
        processing: false,
        loaded: true,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.skipToNextPage ? state.currentPage + 1 : state.currentPage,
        totalElements: action.payload.totalElements,
        signatureId: action.payload.signatureId,
        rule: action.payload.rule,
      });
    }

    case DeduplicationSetsActionTypes.REMOVE_SETS: {
      return Object.assign({}, state, {
        objects: [],
        processing: false,
        loaded: false,
        totalPages: 0,
        currentPage: 0,
        totalElements: 0,
        signatureId: null,
        rule: null
      });
    }

    case DeduplicationSetsActionTypes.DELETE_SET: {
      return deleteSet(state, action as DeleteSetAction);
    }

    default: {
      return state;
    }
  }
}

/**
 * Deletes the set from the state.
 * @param state - the current state
 * @param action - the action to perform on the state
 * @returns - the new state
 */
function deleteSet(state: DeduplicationSetState, action: DeleteSetAction): DeduplicationSetState {
  const setData = [...state.objects];
  if (hasValue(setData)) {
    const setIdx = setData.findIndex(x => isEqual(x.id, action.payload.setId));
    if (setIdx > -1) {
      setData.splice(setIdx, 1);
      return { ...state, objects: [...setData] };
    }
  }
  return state;
}

