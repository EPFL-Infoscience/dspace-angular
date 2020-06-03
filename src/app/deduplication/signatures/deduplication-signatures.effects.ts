import { Injectable } from '@angular/core';
import { of as observableOf } from 'rxjs';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

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
   * Retrieve all deduplication signatures.
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
// non credo serva
  /*@Effect() addSignatures$ = this.actions$.pipe(
    ofType(DeduplicationSignaturesActionTypes.ADD_SIGNATURES),
    switchMap((action: AddSignaturesAction) => {
      return this.workingPlanService.initWorkingPlan(action.payload.signatures).pipe(
        map((workpackages: Workpackage[]) => new InitWorkingplanSuccessAction(workpackages)),
        catchError((error: Error) => {
          if (error) {
            console.error(error.message);
          }
          return observableOf(new InitWorkingplanErrorAction())
        }))
    })
  );*/

  constructor(
    private actions$: Actions,
    private store$: Store<any>,
    private deduplicationSignaturesService: DeduplicationSignaturesService
  ) { }
}
