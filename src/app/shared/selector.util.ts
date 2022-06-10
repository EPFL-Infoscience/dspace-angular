import { createSelector, MemoizedSelector, Selector } from '@ngrx/store';
import { isEqual } from 'lodash';
import { hasValue } from './empty.util';

/**
 * Export a function to return a subset of the state by key
 */
export function keySelector<T, V>(parentSelector: Selector<any, any>, subState: string, key: string): MemoizedSelector<T, V> {
  return createSelector(parentSelector, (state: T) => {
    if (hasValue(state) && hasValue(state[subState])) {
      return state[subState][key];
    } else {
      return undefined;
    }
  });
}

/**
 * Export a function to return a subset of the state
 */
export function subStateSelector<T, V>(parentSelector: Selector<any, any>, subState: string): MemoizedSelector<T, V> {
  return createSelector(parentSelector, (state: T) => {
    if (hasValue(state) && hasValue(state[subState])) {
      return state[subState];
    } else {
      return undefined;
    }
  });
}

/**
 * @param parentSelector The selector to use to get the parent state
 * @param elementId The id of the element to get
 * @param subState The sub state to get
 * @param idSelector The selector to use to get the id
 * @returns The value of the element
 */
export function arraySubStateSelector<T, V>(parentSelector: Selector<any, any>, elementId: string, subState: string, idSelector: string): MemoizedSelector<T, V> {
  return createSelector(parentSelector, (state: T[]) => {
    if (hasValue(state) && state.length > 0) {
      const elementState = state.find(x => x[idSelector] === elementId);
      if (hasValue(elementState)) {
        return elementState[subState];
      }
    } else {
      return undefined;
    }
  });
}
