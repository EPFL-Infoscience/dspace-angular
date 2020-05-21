import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import {
  // deduplicationObjectReducer,
  // DeduplicationObjectState
} from './objects/deduplication-objects.reducer';

/**
 * The Submission State
 */
export interface DeduplicationState {
  // 'objects': DeduplicationObjectState,
  // 'signatures': DeduplictionSigntureState,
}

export const deduplicationReducers: ActionReducerMap<DeduplicationState> = {
  // objects: deduplicationObjectReducer,
  // signatures: deduplicationSignatureReducer,
};

export const deduplicationSelector = createFeatureSelector<DeduplicationState>('deduplication');
