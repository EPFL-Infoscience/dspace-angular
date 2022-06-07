import { SetObject } from '../../core/deduplication/models/set.model';
import {
  DeduplicationSetsActionTypes,
  DeduplicationSetsActions,
} from './deduplication-sets.actions';

export interface DeduplicationSetItemsState {
  objects: SetObject[];
  processing: boolean;
  loaded: boolean;
  totalPages: number;
  currentPage: number;
  totalElements: number;
  setId: string;
}

const deduplicationObjectInitialState: DeduplicationSetItemsState = {
  objects: [],
  processing: false,
  loaded: false,
  totalPages: 0,
  currentPage: 0,
  totalElements: 0,
  setId: null
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
export function deduplicationSetItemsReducer(state = deduplicationObjectInitialState, action: DeduplicationSetsActions): DeduplicationSetItemsState {
  switch (action.type) {

    case DeduplicationSetsActionTypes.RETRIEVE_ALL_SET_ITEMS: {
      return Object.assign({}, state, {
        processing: true
      });
    }

    case DeduplicationSetsActionTypes.RETRIEVE_ALL_SET_ITEMS_ERROR: {
      return Object.assign({}, state, {
        processing: false,
        loaded: true,
        currentPage: 0
      });
    }

    case DeduplicationSetsActionTypes.ADD_SET_ITEMS: {
      return Object.assign({}, state, {
        objects: state.objects,
        processing: false,
        loaded: true,
        // totalPages: action.payload.totalPages,
        // currentPage: state.currentPage + 1,
        // totalElements: action.payload.totalElements,
        setId: action.payload.setId,
      });
    }

    default: {
      return state;
    }
  }
}
