import { createSelector } from "@ngrx/store";
import { StatisticsState } from "./statistics.reducer";

/**
 * Returns the statistic state.
 * @param state Top level state.
 * @returns  {StatisticsState}
 */
const getStatisticState = (state: any) => state.statistics;

/**
 * Returns a category id.
 * @function _getCategoryId
 * @param {State} state 
 * @returns {string}
 */
const _getCategoryId = (state: StatisticsState) => state.categoryId;

/**
 * Returns a report id.
 * @function _getReportId
 * @param {State} state 
 * @returns {string}
 */
const _getReportId = (state: StatisticsState) => state.reportId;

/**
 * Returns the authentication error.
 * @function getCategoryId
 * @param {StatisticsState} state
 * @param {any} props
 * @return {string}
 */
export const getCategoryId = createSelector(getStatisticState, _getCategoryId);

/**
 * Returns the authentication error.
 * @function getReportId
 * @param {StatisticsState} state
 * @param {any} props
 * @return {string}
 */
export const getReportId = createSelector(getStatisticState, _getReportId);
