import { createSelector, MemoizedSelector } from '@ngrx/store';
import { subStateSelector } from '../shared/selector.util';
import { DeduplicationState, deduplicationSelector } from './deduplication.reducer';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { DeduplicationSignatureState } from './signatures/deduplication-signatures.reducer';

/**
 * Returns the deduplication state.
 * @function _getDeduplicationState
 * @param {AppState} state Top level state.
 * @return {DeduplicationState}
 */
const _getDeduplicationState = (state: any) => state.deduplication;

/**
 * Returns the signature State.
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

/**
 * Returns true if the deduplication signatures are processing.
 * @function isDeduplicationSignaturesProcessingSelector
 * @return {boolean}
 */
export const isDeduplicationSignaturesProcessingSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.signatures.processing
);

/**
 * Returns the total available pages of Deduplication signatures.
 * @function getDeduplicationSignaturesTotalPagesSelector
 * @return {number}
 */
export const getDeduplicationSignaturesTotalPagesSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.signatures.totalPages
);

/**
 * Returns the current page of Deduplication signatures.
 * @function getDeduplicationSignaturesCurrentPageSelector
 * @return {number}
 */
export const getDeduplicationSignaturesCurrentPageSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.signatures.currentPage
);

/**
 * Returns the total number of Deduplication signatures.
 * @function getDeduplicationSignaturesTotalsSelector
 * @return {number}
 */
export const getDeduplicationSignaturesTotalsSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.signatures.totalElements
);
