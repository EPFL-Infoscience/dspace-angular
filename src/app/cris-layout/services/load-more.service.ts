import { environment } from '../../../environments/environment';
import { NestedMetadataGroupEntry } from '../cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/metadataGroup/metadata-group.component';

interface ComputedData {
  firstLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>;
  lastLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>;
  isConfigured: boolean;
  moreLimit: number;
  lastLimit: number;
}

export class LoadMoreService  {

  /**
   * returns the limits of how many data loaded from first and last
   */
  getComputedData = (componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>, rendering: string): ComputedData => {
    let lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    let firstLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>;
    let isConfigured = componentsToBeRenderedMap.size !== 1 ;
    const moreLimit = this.getLimitsFromRendering(rendering, 'more');
    const lastLimit = moreLimit > 0 ? this.getLimitsFromRendering(rendering, 'last') : 0;
    if ((componentsToBeRenderedMap.size  <= moreLimit + lastLimit) || (!moreLimit && !lastLimit)) {
       isConfigured = false;
       firstLimitedDataToBeRenderedMap = componentsToBeRenderedMap;
    } else {
       firstLimitedDataToBeRenderedMap = this.fillFirstLimitedData(componentsToBeRenderedMap,moreLimit);
       lastLimitedDataToBeRenderedMap = this.fillLastLimitedData(componentsToBeRenderedMap,lastLimit);
    }
    return {
        firstLimitedDataToBeRenderedMap,
        lastLimitedDataToBeRenderedMap,
        isConfigured,
        moreLimit,
        lastLimit
    };
   }

  /**
   * Get the information about 'more' or 'last' limits from the rendering type.
   * If the number is undefined, fall back on default environment values.
   * @param {string} rendering the rendering type, e.g. `crisref.more.2.last`
   * @param {string} limitType 'more' or 'last'
   * @returns {number} the numer of items to be shown, or 0 if the limit is not specified for the current rendering type.
   */
  getLimitsFromRendering(rendering: string, limitType: string): number {
    const limitInfo = rendering.split('.').filter((chunk) => chunk.startsWith(limitType));
    if (limitInfo.length) {
      const limitNumber = Number(limitInfo[0].substr(limitType.length)); // empty strings returns 0
      return isNaN(limitNumber) || limitNumber === 0 ? environment?.crisLayout?.metadataBox?.loadMore[limitType] : limitNumber;
    } else {
      return 0;
    }
  }

  /**
   * fill all the data when user click on more
   * @param componentsToBeRenderedMap
   * @param rendering the rendering type
   */
  fillAllData = (componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>, rendering: string): ComputedData => {
    const firstLimitedDataToBeRenderedMap = componentsToBeRenderedMap;
    const lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    const isConfigured = true;
    const moreLimit = this.getLimitsFromRendering(rendering, 'more');
    const lastLimit = moreLimit > 0 ? this.getLimitsFromRendering(rendering, 'last') : 0;
    return {
      firstLimitedDataToBeRenderedMap,
      lastLimitedDataToBeRenderedMap,
      isConfigured,
      moreLimit,
      lastLimit
    };
  }

  /**
   * Fill the first limited list of the metadata
   */
  fillFirstLimitedData = (componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>, moreLimit: number): Map<number, NestedMetadataGroupEntry[]> => {
    const firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    for (let i = 0; i < moreLimit ; i++) {
      if (firstLimitedDataToBeRenderedMap.size < componentsToBeRenderedMap.size) {
            firstLimitedDataToBeRenderedMap.set(i,componentsToBeRenderedMap.get(i));
      }
    }
    return firstLimitedDataToBeRenderedMap;
  }

  /**
   * Fill the last limited list of the metadata
   */
  fillLastLimitedData = (componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>, lastLimit: number): Map<number, NestedMetadataGroupEntry[]> => {
    const lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    for (let i = componentsToBeRenderedMap.size  - lastLimit; i < componentsToBeRenderedMap.size; i++) {
            lastLimitedDataToBeRenderedMap.set(i,componentsToBeRenderedMap.get(i));
      }
    return lastLimitedDataToBeRenderedMap;
  }
}
