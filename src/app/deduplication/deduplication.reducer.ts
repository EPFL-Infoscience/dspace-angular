import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { deduplicationItemsToCompareReducer, DeduplicationItemsToCompareState } from './deduplication-merge/deduplication-items-merge.reducer';
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
  'compare': DeduplicationItemsToCompareState;
}

export const deduplicationReducers: ActionReducerMap<DeduplicationState> = {
  sets: deduplicationSetReducer,
  signatures: deduplicationSignatureReducer,
  compare: deduplicationItemsToCompareReducer
};

export const deduplicationSelector = createFeatureSelector<DeduplicationState>('deduplication');
