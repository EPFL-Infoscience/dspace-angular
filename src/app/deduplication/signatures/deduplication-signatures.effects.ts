import { Injectable } from '@angular/core';
import { of as observableOf } from 'rxjs';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom, mergeMap } from 'rxjs/operators';

import {
  RetrieveAllSignaturesAction,
  RetrieveAllSignaturesErrorAction,
  DeduplicationSignaturesActionTypes,
  AddSignaturesAction,
} from './deduplication-signatures.actions';
import { Store } from '@ngrx/store';
import { SignatureObject } from '../../core/deduplication/models/signature.model';
import { PaginatedList } from '../../core/data/paginated-list';
import { RemoteData } from '../../core/data/remote-data';
import { FindListOptions } from '../../core/data/request.models';
import { SortOptions, SortDirection } from '../../core/cache/models/sort-options.model';
import { DeduplicationSignaturesService } from './deduplication-signatures.service';
import { DeduplicationSignatureState } from './deduplication-signatures.reducer';
// import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';

/**
 * Provides effect methods for jsonPatch Operations actions.
 */
@Injectable()
export class DeduplicationSignaturesEffects {

  /**
   * Retrieve all deduplication signatures (paginated).
   */
  @Effect() retrieveAllSignatures$ = this.actions$.pipe(
    ofType(DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES),
    withLatestFrom(this.store$),
    switchMap(([action, currentState]: [RetrieveAllSignaturesAction, DeduplicationSignatureState]) => {
      return this.deduplicationSignaturesService.getSignatures(action.payload.elementsPerPage, currentState.currentPage).pipe(
        map((signatures: PaginatedList<SignatureObject>) =>
          new AddSignaturesAction(signatures.page)
        ),
        catchError((error: Error) => {
          if (error) {
            console.error(error.message);
          }
          return observableOf(new RetrieveAllSignaturesErrorAction())
        }));
    })
  );

  /**
   * Add workpackages to workingplan state
   */
  /*@Effect() addSignatures$ = this.actions$.pipe(
    ofType(DeduplicationSignaturesActionTypes.ADD_SIGNATURES),
    withLatestFrom(this.store$),
    map(([action, currentState]: [AddSignaturesAction, DeduplicationSignatureState]) => {
      let a = currentState.currentPage

      // return this.parseSaveResponse((currentState.submission as SubmissionState).objects[action.payload.submissionId], action.payload.submissionObject, action.payload.submissionId);
    }),
    mergeMap((actions) => observableFrom(actions)));
  );*/

  constructor(
    private actions$: Actions,
    private store$: Store<any>,
    private deduplicationSignaturesService: DeduplicationSignaturesService
  ) { }
}
