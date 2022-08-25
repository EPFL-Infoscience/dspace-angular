import { SetItemsObject } from './../core/deduplication/models/set-items.model';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  signaturesObjectSelector,
  isDeduplicationSignaturesLoadedSelector,
  isDeduplicationSignaturesProcessingSelector,
  getDeduplicationSignaturesTotalPagesSelector,
  getDeduplicationSignaturesCurrentPageSelector,
  getDeduplicationSignaturesTotalsSelector,
  setsObjectsSelector,
  isDeduplicationSetsLoadedSelector,
  isDeduplicationSetsProcessingSelector,
  getDeduplicationSetsTotalPagesSelector,
  getDeduplicationSetsCurrentPageSelector,
  getDeduplicationSetsTotalsSelector,
  setItemsObjectsSelector,
  itemsToCompareObjectSelector,
} from './selectors';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { DeduplicationState } from './deduplication.reducer';
import { RetrieveAllSignaturesAction } from './signatures/deduplication-signatures.actions';
import { SetObject } from '../core/deduplication/models/set.model';
import {
  DeleteItemAction,
  DeleteSetAction,
  RetrieveSetItemsAction,
  RetrieveSetsBySignatureAction,
  AddItemsToCompareAction,
  DeleteItemsToCompareAction,
} from './sets/deduplication-sets.actions';

/**
 * The service handling the Deduplication State.
 */
@Injectable()
export class DeduplicationStateService {
  /**
   * Initialize the service variables.
   * @param {Store<DeduplicationState>} store
   */
  constructor(private store: Store<DeduplicationState>) {}

  /**
   * Returns the list of deduplication signatures from the state.
   *
   * @return Observable<SignatureObject>
   *    The list of deduplication signatures.
   */
  public getDeduplicationSignatures(): Observable<SignatureObject[]> {
    return this.store.pipe(select(signaturesObjectSelector()));
  }

  /**
   * Returns the information about the loading status of the signatures (if it's running or not).
   *
   * @return Observable<boolean>
   *    'true' if the signatures are loading, 'false' otherwise.
   */
  public isDeduplicationSignaturesLoading(): Observable<boolean> {
    return this.store.pipe(
      select(isDeduplicationSignaturesLoadedSelector),
      map((loaded: boolean) => !loaded)
    );
  }

  /**
   * Returns the information about the loading status of the signatures (whether or not they were loaded).
   *
   * @return Observable<boolean>
   *    'true' if the signatures are loaded, 'false' otherwise.
   */
  public isDeduplicationSignaturesLoaded(): Observable<boolean> {
    return this.store.pipe(select(isDeduplicationSignaturesLoadedSelector));
  }

  /**
   * Returns the information about the processing status of the signatures (if it's running or not).
   *
   * @return Observable<boolean>
   *    'true' if there are operations running on the signatures (ex.: a REST call), 'false' otherwise.
   */
  public isDeduplicationSignaturesProcessing(): Observable<boolean> {
    return this.store.pipe(select(isDeduplicationSignaturesProcessingSelector));
  }

  /**
   * Returns, from the state, the total available pages of the deduplication signatures.
   *
   * @return Observable<number>
   *    The number of the deduplication signatures pages.
   */
  public getDeduplicationSignaturesTotalPages(): Observable<number> {
    return this.store.pipe(
      select(getDeduplicationSignaturesTotalPagesSelector)
    );
  }

  /**
   * Returns the current page of the deduplication signatures, from the state.
   *
   * @return Observable<number>
   *    The number of the current deduplication signatures page.
   */
  public getDeduplicationSignaturesCurrentPage(): Observable<number> {
    return this.store.pipe(
      select(getDeduplicationSignaturesCurrentPageSelector)
    );
  }

  /**
   * Returns the total number of the deduplication signatures.
   *
   * @return Observable<number>
   *    The number of the deduplication signatures.
   */
  public getDeduplicationSignaturesTotals(): Observable<number> {
    return this.store.pipe(select(getDeduplicationSignaturesTotalsSelector));
  }

  /**
   * Dispatch a request to change the Singatures state, retrieving the signatures from the server.
   *
   * @param elementsPerPage
   *    The number of the signatures per page.
   */
  public dispatchRetrieveDeduplicationSignatures(): void {
    this.store.dispatch(new RetrieveAllSignaturesAction());
  }

  //#region Sets

  /**
   * Returns the list of deduplication sets from the state.
   * @return {*}  {Observable<SetObject[]>}
   */
  public getDeduplicationSetsPerSignature(): Observable<SetObject[]> {
    return this.store.pipe(select(setsObjectsSelector()));
  }

  /**
   *  Dispatch a request to change the Sets state, retrieving the sets from the server.
   * @param signatureId The signature id to retrieve the sets
   * @param rule The rule to filter the sets
   * @param elementsPerPage The number of elements per page
   */
  public dispatchRetrieveDeduplicationSetsBySignature(
    signatureId: string,
    rule: string,
    elementsPerPage: number
  ): void {
    this.store.dispatch(
      new RetrieveSetsBySignatureAction(elementsPerPage, signatureId, rule)
    );
  }

  /**
   * @returns {Observable<boolean>} 'true' if the sets are loading, 'false' otherwise.
   */
  public isDeduplicationSetsLoading(): Observable<boolean> {
    return this.store.pipe(
      select(isDeduplicationSetsLoadedSelector),
      map((loaded: boolean) => !loaded)
    );
  }

  /**
   * @returns {Observable<boolean>} 'true' if the sets are loaded, 'false' otherwise.
   */
  public isDeduplicationSetsLoaded(): Observable<boolean> {
    return this.store.pipe(select(isDeduplicationSetsLoadedSelector));
  }

  /**
   * @returns {Observable<boolean>} 'true' if the sets are processing, 'false' otherwise.
   */
  public isDeduplicationSetsProcessing(): Observable<boolean> {
    return this.store.pipe(select(isDeduplicationSetsProcessingSelector));
  }

  /**
   * @returns {Observable<number>} The number of the deduplication sets pages.
   */
  public getDeduplicationSetsTotalPages(): Observable<number> {
    return this.store.pipe(select(getDeduplicationSetsTotalPagesSelector));
  }

  /**
   * @returns {Observable<number>} The number of the current deduplication sets page.
   */
  public getDeduplicationSetsCurrentPage(): Observable<number> {
    return this.store.pipe(select(getDeduplicationSetsCurrentPageSelector));
  }

  /**
   * @returns {Observable<number>} The number of the deduplication sets.
   */
  public getDeduplicationSetsTotals(): Observable<number> {
    return this.store.pipe(select(getDeduplicationSetsTotalsSelector));
  }

  /**
   * Dispatch a request to change the Sets state.
   * @param signatureId The signature id to retrieve the sets
   * @param setId The id of the set to be removed
   */
  public dispatchDeleteSet(signatureId: string, setId: string) {
    this.store.dispatch(new DeleteSetAction(signatureId, setId));
  }
  //#endregion Sets

  //#region Items

  /**
   * @returns {Observable<ItemObject[]>} The list of items from the state.
   */
  public getDeduplicationSetItems(setId: string): Observable<SetItemsObject[]> {
    return this.store.pipe(select(setItemsObjectsSelector(setId)));
  }

  /**
   * Dispatch a request to change the Items state, retrieving the items from the server.
   * @param setId The id of the set to retrieve the items
   */
  public dispatchRetrieveDeduplicationSetItems(setId: string): void {
    this.store.dispatch(new RetrieveSetItemsAction(setId));
  }

  /**
   * Dispatch a request to change the Items state.
   * @param signatureId The signature id to retrieve the sets
   * @param itemId The id of the item to be removed
   * @param setId The id of the to which the item belong
   */
  public dispatchRemoveItem(
    signatureId: string,
    itemId: string,
    setId: string
  ) {
    this.store.dispatch(new DeleteItemAction(signatureId, itemId, setId));
  }

  public getItemsToCompare(): Observable<string[]> {
    return this.store.pipe(select(itemsToCompareObjectSelector()));
  }

  public dispatchAddItemsToCompare(items: string[]) {
    this.store.dispatch(new AddItemsToCompareAction(items));
  }

  public dispatchRemoveItemsToCompare() {
    this.store.dispatch(new DeleteItemsToCompareAction());
  }
  //#endregion Items
}
