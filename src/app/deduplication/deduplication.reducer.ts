import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import {
  DeduplicationSetState,
  deduplicationSetReducer,
} from './sets/deduplication-sets.reducer';

import {
  DeduplicationSignatureState,
  deduplicationSignatureReducer,
} from './signatures/deduplication-signatures.reducer';

/**
 * The Submission State
 */
export interface DeduplicationState {
  'sets': DeduplicationSetState,
  'signatures': DeduplicationSignatureState,
}

export const deduplicationReducers: ActionReducerMap<DeduplicationState> = {
  sets: deduplicationSetReducer,
  signatures: deduplicationSignatureReducer,
};

export const deduplicationSelector = createFeatureSelector<DeduplicationState>('deduplication');
