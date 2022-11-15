import { createSelector, MemoizedSelector } from '@ngrx/store';
import { subStateSelector } from '../shared/selector.util';
import { DeduplicationState, deduplicationSelector } from './deduplication.reducer';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { DeduplicationSignatureState } from './signatures/deduplication-signatures.reducer';
import { DeduplicationSetState } from './sets/deduplication-sets.reducer';
import { SetObject } from '../core/deduplication/models/set.model';

/**
 * Returns the signature State.
 * @function signaturesStateSelector
 * @return {DeduplicationSignatureState}
 */
export function signaturesStateSelector(): MemoizedSelector<DeduplicationState, DeduplicationSignatureState> {
  return subStateSelector<DeduplicationState, DeduplicationSignatureState>(deduplicationSelector, 'signatures');
}

/**
 * Returns the deduplication signatures list.
 * @function signaturesObjectSelector
 * @return {SignatureObject[]}
 */
export function signaturesObjectSelector(): MemoizedSelector<DeduplicationState, SignatureObject[]> {
  return subStateSelector<DeduplicationState, SignatureObject[]>(signaturesStateSelector(), 'objects');
}

/**
 * Returns true if the deduplication signatures are loaded.
 * @function isDeduplicationSignaturesLoadedSelector
 * @return {boolean}
 */
export const isDeduplicationSignaturesLoadedSelector =  createSelector(deduplicationSelector,
  (state: DeduplicationState) => state.signatures.loaded
);

/**
 * Returns true if the deduplication signatures are processing.
 * @function isDeduplicationSignaturesProcessingSelector
 * @return {boolean}
 */
export const isDeduplicationSignaturesProcessingSelector = createSelector(deduplicationSelector,
  (state: DeduplicationState) => state.signatures.processing
);

/**
 * Returns the total available pages of Deduplication signatures.
 * @function getDeduplicationSignaturesTotalPagesSelector
 * @return {number}
 */
export const getDeduplicationSignaturesTotalPagesSelector = createSelector(deduplicationSelector,
  (state: DeduplicationState) => state.signatures.totalPages
);

/**
 * Returns the total number of Deduplication signatures.
 * @function getDeduplicationSignaturesTotalsSelector
 * @return {number}
 */
export const getDeduplicationSignaturesTotalsSelector = createSelector(deduplicationSelector,
  (state: DeduplicationState) => state.signatures.totalElements
);

/**
 * Returns the deduplication sets State.
 */
export function setsPerSignatureObjectSelector(): MemoizedSelector<DeduplicationState, DeduplicationSetState> {
  return subStateSelector<DeduplicationState, DeduplicationSetState>(deduplicationSelector, 'sets');
}

/**
 * Returns the deduplication sets list.
 */
export function setsObjectsSelector(): MemoizedSelector<DeduplicationState, SetObject[]> {
  return subStateSelector<DeduplicationState, SetObject[]>(setsPerSignatureObjectSelector(), 'objects');
}

/**
 * Returns true if the deduplication sets are loaded.
 */
export const isDeduplicationSetsLoadedSelector = createSelector(deduplicationSelector,
  (state: DeduplicationState) => state.sets.loaded
);

/**
 * Returns true if the deduplication signatures are processing.
 * @function isDeduplicationSignaturesProcessingSelector
 * @return {boolean}
 */
export const isDeduplicationSetsProcessingSelector = createSelector(deduplicationSelector,
  (state: DeduplicationState) => state.sets.processing
);

/**
 * Returns the total available pages of Deduplication signatures.
 * @function getDeduplicationSignaturesTotalPagesSelector
 * @return {number}
 */
export const getDeduplicationSetsTotalPagesSelector = createSelector(deduplicationSelector,
  (state: DeduplicationState) => state.sets.totalPages
);

/**
 * Returns the current page of Deduplication signatures.
 * @function getDeduplicationSetsCurrentPageSelector
 * @return {number}
 */
export const getDeduplicationSetsCurrentPageSelector = createSelector(deduplicationSelector,
  (state: DeduplicationState) => state.sets.currentPage
);

/**
 * Returns the total number of Deduplication signatures.
 * @function getDeduplicationSetsTotalsSelector
 * @return {number}
 */
export const getDeduplicationSetsTotalsSelector = createSelector(deduplicationSelector,
  (state: DeduplicationState) => state.sets.totalElements
);

export function itemsToCompareStateSelector(): MemoizedSelector<DeduplicationState, DeduplicationSetState> {
  return subStateSelector<DeduplicationState, DeduplicationSetState>(deduplicationSelector, 'compare');
}


export function itemsToCompareObjectSelector(): MemoizedSelector<DeduplicationState, string[]> {
  return subStateSelector<DeduplicationState, string[]>(itemsToCompareStateSelector(), 'objects');
}
