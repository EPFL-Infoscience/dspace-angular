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
} from './selectors';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { DeduplicationState } from './deduplication.reducer';
import { RetrieveAllSignaturesAction } from './signatures/deduplication-signatures.actions';

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
    return this.store.pipe(select(getDeduplicationSignaturesCurrentPageSelector))
  }

  /**
   * Returns the total number of the deduplication signatures.
   *
   * @return Observable<number>
   *    The number of the deduplication signatures.
   */
  public getDeduplicationSignaturesTotals(): Observable<number> {
    return this.store.pipe(select(getDeduplicationSignaturesTotalsSelector))
  }

  /**
   * Dispatch a request to change the Singatures state, retrieving the signatures from the server.
   *
   * @param elementsPerPage
   *    The number of the signatures per page.
   */
  public dispatchRetrieveDeduplicationSignatures(elementsPerPage: number): void {
    this.store.dispatch(new RetrieveAllSignaturesAction(elementsPerPage))
  }
}
