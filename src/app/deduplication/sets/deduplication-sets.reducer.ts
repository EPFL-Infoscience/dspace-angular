import { isEqual } from 'lodash';
import { hasValue } from './../../shared/empty.util';
import { SetObject } from '../../core/deduplication/models/set.model';
import {
  DeduplicationSetsActionTypes,
  DeduplicationSetsActions,
  DeleteSetAction,
  RemoveItemPerSetAction,
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
  currentPage: 1,
  totalElements: 0,
  signatureId: null,
  rule: null,
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
export function deduplicationSetReducer(
  state = deduplicationObjectInitialState,
  action: DeduplicationSetsActions
): DeduplicationSetState {
  switch (action.type) {
    case DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE: {
      return Object.assign({}, state, {
        processing: true,
      });
    }

    case DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE_ERROR: {
      return Object.assign({}, state, {
        processing: false,
        loaded: true,
        currentPage: 1,
      });
    }

    case DeduplicationSetsActionTypes.ADD_SETS: {
      let objects: SetObject[] = [];
      if (isEqual(state.signatureId, action.payload.signatureId) && isEqual(state.rule, action.payload.rule)) {
        objects = (isEqual(state.objects.length, 0) || action.payload.skipToNextPage)
          ? state.objects.concat(action.payload.objects) : state.objects;
      } else {
        objects = [...action.payload.objects];
      }
      return Object.assign({}, state, {
        objects: objects,
        processing: false,
        loaded: true,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        totalElements: action.payload.totalElements,
        signatureId: action.payload.signatureId,
        rule: action.payload.rule,
      });
    }

    case DeduplicationSetsActionTypes.REMOVE_SETS: {
      return Object.assign({}, state, {
        objects: [],
        processing: false,
        loaded: true,
        totalPages: 0,
        currentPage: 1,
        totalElements: 0,
        signatureId: null,
        rule: null,
      });
    }

    case DeduplicationSetsActionTypes.DELETE_SET: {
      return deleteSet(state, action as DeleteSetAction);
    }

    case DeduplicationSetsActionTypes.DELETE_ITEM_PER_SET: {
      return updateItemsPerSet(state, action as RemoveItemPerSetAction);
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
function deleteSet(
  state: DeduplicationSetState,
  action: DeleteSetAction
): DeduplicationSetState {
  const setData = [...state.objects];
  if (hasValue(setData)) {
    const setIdx = setData.findIndex((x) =>
      isEqual(x.id, action.payload.setId)
    );
    if (setIdx > -1) {
      setData.splice(setIdx, 1);
      const totalElements = state.totalElements - 1;
      return {
        ...state,
        totalElements: totalElements,
        objects: [...setData]
      };
    }
  }
  return state;
}

/**
 * Updates the list of the set items.
 * In case one of the items is deleted, it will be removed from the list.
 * If there are only two items left and one of them is deleted, the set will be removed from the store.
 * @param state - the current state
 * @param action - the action to perform on the state
 * @returns - the new state
 */
function updateItemsPerSet(state: DeduplicationSetState,
  action: RemoveItemPerSetAction) {
  const setData = [...state.objects];
  if (hasValue(setData) && setData.length > 0) {
    const set = setData.find((x) => isEqual(x.id, action.payload.setId));
    const setIdx = setData.findIndex((x) => isEqual(x.id, action.payload.setId));
    if (hasValue(set) && setIdx > -1) {
      const itemIdx = set.itemsList.findIndex(i => isEqual(i.id, action.payload.itemId));
      const itemsList = [...set.itemsList];
      if (hasValue(itemIdx)) {
        itemsList.splice(itemIdx, 1);
      }
      const updatedSet: SetObject = Object.assign(new SetObject(), {
        ...set,
        itemsList: itemsList
      });
      setData[setIdx] = updatedSet;

      if (itemsList.length <= 1) {
        return deleteSet(state, new DeleteSetAction(action.payload.signatureId, action.payload.setId, action.payload.rule));
      }

      return { ...state, objects: [...setData] };
    }
  } else {
    return state;
  }
}
