
import { differenceWith, findKey, isEqual, uniqWith } from 'lodash';

import { hasValue, isNotEmpty, isNotNull, isUndefined } from '../../shared/empty.util';
import { SignatureObject } from '../../core/deduplication/models/signature.model';
import {
  DeduplicationSignaturesActions,
  DeduplicationSignaturesActionTypes
} from './deduplication-signatures.actions';

/*import {

} from './deduplication-objects.actions';*/

export interface DeduplicationSignatureState {
  objects: SignatureObject[];
  processing: boolean;
  loaded: boolean;
  totalPages: number;
  currentPage: number;
}

const deduplicationSignatureInitialState: DeduplicationSignatureState = {
  objects: [],
  processing: false,
  loaded: false,
  totalPages: null,
  currentPage: 0
};

/**
 * The deduplication signatures Reducer
 *
 * @param state
 *    the current state
 * @param action
 *    the action to perform on the state
 * @return DeduplicationSigntureState
 *    the new state
 */
export function deduplicationSignatureReducer(state = deduplicationSignatureInitialState, action: DeduplicationSignaturesActions): DeduplicationSignatureState {
  switch (action.type) {
    case DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES: {
      return Object.assign({}, deduplicationSignatureInitialState, {
        processing: true,
        currentPage: state.currentPage + 1
      });
    }

    case DeduplicationSignaturesActionTypes.ADD_SIGNATURES: {
      return Object.assign({}, deduplicationSignatureInitialState, {
        objects: state.objects.concat(action.payload.signatures),
        loaded: true,
        processing: false
      });
    }

    default: {
      return state;
    }
  }
}
