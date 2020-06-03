
import { differenceWith, findKey, isEqual, uniqWith } from 'lodash';

import { hasValue, isNotEmpty, isNotNull, isUndefined } from '../../shared/empty.util';
import { SetObject } from '../../core/deduplication/models/set.model';
import {
  DeduplicationSetsActionTypes,
  DeduplicationSetsActions,
} from './deduplication-sets.actions';

export interface DeduplicationSetState {
  sets: SetObject[];
  processing: boolean;
  loaded: boolean;
}

const deduplicationObjectInitialState: DeduplicationSetState = {
  sets: [],
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
export function deduplicationSetReducer(state = deduplicationObjectInitialState, action: DeduplicationSetsActions): DeduplicationSetState {
  switch (action.type) {
    /*case DeduplicationObjectsActionTypes.RETRIEVE_ALL_SIGNATURES: {
      return Object.assign({}, deduplicationObjectInitialState, {
        processing: true
      });
    }*/

    default: {
      return state;
    }
  }
}
