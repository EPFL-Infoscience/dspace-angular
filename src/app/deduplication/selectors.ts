import { createSelector, MemoizedSelector } from '@ngrx/store';

import { DeduplicationState, deduplicationSelector } from './deduplication.reducer';
import { AppState } from '../app.reducer';
import { isNotEmpty } from '../shared/empty.util';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { SetObject } from '../core/deduplication/models/set.model';
import { subStateSelector } from '../shared/selector.util';
import { DeduplicationSignatureState } from './signatures/deduplication-signatures.reducer';

/**
 * Returns the deduplication state.
 * @function _getDeduplicationState
 * @param {AppState} state Top level state.
 * @return {DeduplicationState}
 */
const _getDeduplicationState = (state: any) => state.deduplication;

/**
 * Returns the Workpackage object.
 * @function signaturesStateSelector
 * @return {DeduplicationSignatureState}
 */
export function signaturesStateSelector(): MemoizedSelector<DeduplicationState, DeduplicationSignatureState> {
  return subStateSelector<DeduplicationState,DeduplicationSignatureState>(deduplicationSelector, 'signatures');
}

/**
 * Returns the deduplication signatures list.
 * @function signaturesObjectSelector
 * @return {SignatureObject[]}
 */
export function signaturesObjectSelector(): MemoizedSelector<DeduplicationState, SignatureObject[]> {
  return subStateSelector<DeduplicationState, SignatureObject[]>(signaturesStateSelector(), 'objects')
}

/**
 * Returns true if the deduplication signatures are loaded.
 * @function isDeduplicationSignaturesLoadedSelector
 * @return {boolean}
 */
export const isDeduplicationSignaturesLoadedSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.signatures.loaded
);
