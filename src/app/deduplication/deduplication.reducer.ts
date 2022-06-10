import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { deduplicationSetItemsReducer, DeduplicationSetItemsState } from './sets/deduplication-set-items.reducer';

import {
  DeduplicationSetState,
  deduplicationSetReducer,
} from './sets/deduplication-sets.reducer';

import {
  DeduplicationSignatureState,
  deduplicationSignatureReducer,
} from './signatures/deduplication-signatures.reducer';

/**
 * The Deduplication State
 */
export interface DeduplicationState {
  'sets': DeduplicationSetState;
  'signatures': DeduplicationSignatureState;
  'items': DeduplicationSetItemsState[];
}

export const deduplicationReducers: ActionReducerMap<DeduplicationState> = {
  sets: deduplicationSetReducer,
  signatures: deduplicationSignatureReducer,
  items: deduplicationSetItemsReducer
};

export const deduplicationSelector = createFeatureSelector<DeduplicationState>('deduplication');
