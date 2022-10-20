import { Item } from './../../core/shared/item.model';
import { isEqual } from 'lodash';
import { hasValue } from './../../shared/empty.util';
import {
  DeduplicationSetsActionTypes,
  DeduplicationSetsActions,
  DeleteItemAction,
} from './deduplication-sets.actions';

/**
 * The interface representing the set items state.
 */
export interface DeduplicationSetItemsState {
  objects: Item[];
  processing: boolean;
  loaded: boolean;
  setId: string;
}

/**
 * Used for the items state initialization.
 */
const deduplicationObjectInitialState: DeduplicationSetItemsState[] = [{
  objects: [],
  processing: false,
  loaded: false,
  setId: null
}];

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
export function deduplicationSetItemsReducer(state = deduplicationObjectInitialState, action: DeduplicationSetsActions): DeduplicationSetItemsState[] {
  switch (action.type) {

    case DeduplicationSetsActionTypes.RETRIEVE_ALL_SET_ITEMS: {
      const requestedState = state.find(item => isEqual(item.setId, action.payload.setId));
      return Object.assign([], requestedState, {
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
      return state.concat([{
        objects: action.payload.objects,
        processing: false,
        loaded: true,
        setId: action.payload.setId,
      }]);
    }

    case DeduplicationSetsActionTypes.DELETE_ITEM: {
      return deleteItem(state, action);
    }

    case DeduplicationSetsActionTypes.REMOVE_ALL_ITEMS: {
      return [{
        objects: [],
        processing: false,
        loaded: false,
        setId: null
      }];
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
function deleteItem(state: DeduplicationSetItemsState[], action: DeleteItemAction): DeduplicationSetItemsState[] {
  const itemsData = [...state.find(item => isEqual(item.setId, action.payload.setId))?.objects];
  if (hasValue(itemsData)) {
    const itemIdx = itemsData.findIndex(x => isEqual(x.id, action.payload.itemId));
    if (itemIdx > -1) {
      itemsData.splice(itemIdx, 1);
      return [...state.map(item => { return isEqual(item.setId, action.payload.setId) ? { ...item, objects: itemsData } : item; })];
    }
  }
  return state;
}
