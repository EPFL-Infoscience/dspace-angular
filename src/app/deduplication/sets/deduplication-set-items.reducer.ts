import { hasValue } from 'src/app/shared/empty.util';
import { SetObject } from '../../core/deduplication/models/set.model';
import {
  DeduplicationSetsActionTypes,
  DeduplicationSetsActions,
  DeleteItemAction,
} from './deduplication-sets.actions';

/**
 * The interface representing the set items state.
 */
export interface DeduplicationSetItemsState {
  objects: SetObject[];
  processing: boolean;
  loaded: boolean;
  setId: string;
}

/**
 * Used for the items state initialization.
 */
const deduplicationObjectInitialState: DeduplicationSetItemsState = {
  objects: [],
  processing: false,
  loaded: false,
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
        objects: action.payload.objects,
        processing: false,
        loaded: true,
        setId: action.payload.setId,
      });
    }

    case DeduplicationSetsActionTypes.DELETE_ITEM: {
      return deleteItem(state, action as DeleteItemAction);
    }

    default: {
      return state;
    }
  }
}

/**
 * Deletes an item from the state.
 * @param {DeduplicationSetItemsState} state - the current state
 * @param {DeleteItemAction} action - the action to perform on the state
 * @return {*}  {DeduplicationSetItemsState} - the new state
 */
function deleteItem(state: DeduplicationSetItemsState, action: DeleteItemAction): DeduplicationSetItemsState {
  let itemsData = [...state.objects];
  if (hasValue(itemsData)) {
    const itemIdx = itemsData.findIndex(x => x.id == action.payload.itemId);
    if (itemIdx > -1) {
      itemsData.splice(itemIdx, 1);
      return  { ...state, objects: [...itemsData] };
    }
  }
  return state;
}
