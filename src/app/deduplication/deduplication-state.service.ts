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
} from './selectors';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { DeduplicationState } from './deduplication.reducer';
import { RetrieveAllSignaturesAction } from './signatures/deduplication-signatures.actions';
import { SetObject } from '../core/deduplication/models/set.model';
import { RetrieveSetItemsAction, RetrieveSetsBySignatureAction } from './sets/deduplication-sets.actions';

/**
 * The service handling the Deduplication State.
 */
@Injectable()
export class DeduplicationStateService {

  /**
   * Initialize the service variables.
   * @param {Store<DeduplicationState>} store
   */
  constructor(private store: Store<DeduplicationState>) { }

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
    return this.store.pipe(select(getDeduplicationSignaturesTotalPagesSelector));
  }

  /**
   * Returns the current page of the deduplication signatures, from the state.
   *
   * @return Observable<number>
   *    The number of the current deduplication signatures page.
   */
  public getDeduplicationSignaturesCurrentPage(): Observable<number> {
    return this.store.pipe(select(getDeduplicationSignaturesCurrentPageSelector));
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
  public dispatchRetrieveDeduplicationSignatures(elementsPerPage: number): void {
    this.store.dispatch(new RetrieveAllSignaturesAction(elementsPerPage));
  }

  public getDeduplicationSetsPerSignature(): Observable<SetObject[]>  {
   return this.store.pipe(select(setsObjectsSelector()));
  }

  public dispatchRetrieveDeduplicationSetsBySignature(signatureId: string, rule: string, elementsPerPage:number): void {
    this.store.dispatch(new RetrieveSetsBySignatureAction(elementsPerPage, signatureId, rule));
  }

  public isDeduplicationSetsLoading(): Observable<boolean> {
    return this.store.pipe(
      select(isDeduplicationSetsLoadedSelector),
      map((loaded: boolean) => !loaded)
    );
  }

  public isDeduplicationSetsLoaded(): Observable<boolean> {
    return this.store.pipe(select(isDeduplicationSetsLoadedSelector));
  }

  public isDeduplicationSetsProcessing(): Observable<boolean> {
    return this.store.pipe(select(isDeduplicationSetsProcessingSelector));
  }

  public getDeduplicationSetsTotalPages(): Observable<number> {
    return this.store.pipe(select(getDeduplicationSetsTotalPagesSelector));
  }

  public getDeduplicationSetsCurrentPage(): Observable<number> {
    return this.store.pipe(select(getDeduplicationSetsCurrentPageSelector));
  }

  public getDeduplicationSetsTotals(): Observable<number> {
    return this.store.pipe(select(getDeduplicationSetsTotalsSelector));
  }

  //#region items
  public getDeduplicationSetItems(): Observable<SetItemsObject[]>  {
    return this.store.pipe(select(setItemsObjectsSelector()));
   }

   public dispatchRetrieveDeduplicationSetItems(setId: string): void {
     this.store.dispatch(new RetrieveSetItemsAction(setId));
   }
  //#endregion items
}
