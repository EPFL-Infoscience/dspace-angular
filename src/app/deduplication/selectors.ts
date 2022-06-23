import { SetItemsObject } from './../core/deduplication/models/set-items.model';
import { createSelector, MemoizedSelector } from '@ngrx/store';
import { arraySubStateSelector, subStateSelector } from '../shared/selector.util';
import { DeduplicationState, deduplicationSelector } from './deduplication.reducer';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { DeduplicationSignatureState } from './signatures/deduplication-signatures.reducer';
import { DeduplicationSetState } from './sets/deduplication-sets.reducer';
import { SetObject } from '../core/deduplication/models/set.model';

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
export const isDeduplicationSetsLoadedSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.sets.loaded
);

/**
 * Returns true if the deduplication signatures are processing.
 * @function isDeduplicationSignaturesProcessingSelector
 * @return {boolean}
 */
export const isDeduplicationSetsProcessingSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.sets.processing
);

/**
 * Returns the total available pages of Deduplication signatures.
 * @function getDeduplicationSignaturesTotalPagesSelector
 * @return {number}
 */
export const getDeduplicationSetsTotalPagesSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.sets.totalPages
);

/**
 * Returns the current page of Deduplication signatures.
 * @function getDeduplicationSignaturesCurrentPageSelector
 * @return {number}
 */
export const getDeduplicationSetsCurrentPageSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.sets.currentPage
);

/**
 * Returns the total number of Deduplication signatures.
 * @function getDeduplicationSignaturesTotalsSelector
 * @return {number}
 */
export const getDeduplicationSetsTotalsSelector = createSelector(_getDeduplicationState,
  (state: DeduplicationState) => state.sets.totalElements
);

/**
 * Returns the items State.
 */
export function setItemsObjectSelector(): MemoizedSelector<DeduplicationState, DeduplicationSetState> {
  return subStateSelector<DeduplicationState, DeduplicationSetState>(deduplicationSelector, 'items');
}

/*
 * Returns the items list.
 */
export function setItemsObjectsSelector(setId): MemoizedSelector<DeduplicationState, SetItemsObject[]> {
  return arraySubStateSelector<DeduplicationState, SetItemsObject[]>(setItemsObjectSelector(), setId, 'objects', 'setId');
}


 export function itemsToCompareStateSelector(): MemoizedSelector<DeduplicationState, DeduplicationSetState> {
  return subStateSelector<DeduplicationState, DeduplicationSetState>(deduplicationSelector, 'compare');
}


export function itemsToCompareObjectSelector(): MemoizedSelector<DeduplicationState, SetItemsObject[]> {
  return subStateSelector<DeduplicationState, SetItemsObject[]>(itemsToCompareStateSelector(), 'objects');
}
