import { DeduplicationSetsActions, DeduplicationSetsActionTypes } from './../sets/deduplication-sets.actions';
import { Item } from '../../core/shared/item.model';

/**
 * The interface representing the set items state.
 * @interface DeduplicationSetState
 */
export interface DeduplicationItemsToCompareState {
  objects: Item[];
  processing: boolean;
  loaded: boolean;
}

/**
 * Used for the set state initialization.
 */
const deduplicationObjectInitialState: DeduplicationItemsToCompareState = {
  objects: [],
  processing: false,
  loaded: false,
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
export function deduplicationItemsToCompareReducer(
  state = deduplicationObjectInitialState,
  action: DeduplicationSetsActions
): DeduplicationItemsToCompareState {
  switch (action.type) {
    case DeduplicationSetsActionTypes.RETRIEVE_ITEMS_TO_COMPARE: {
      return Object.assign({}, state, {
        processing: false,
        loaded: true,
      });
    }

    case DeduplicationSetsActionTypes.ADD_ITEMS_TO_COMPARE: {
      return Object.assign({}, state, {
        objects: action.payload.objects,
        processing: false,
        loaded: true,
      });
    }

    case DeduplicationSetsActionTypes.DELETE_ITEMS_TO_COMPARE: {
      return Object.assign({}, state, {
        objects: [],
        processing: false,
        loaded: false
      });
    }

    default: {
      return state;
    }
  }
}


