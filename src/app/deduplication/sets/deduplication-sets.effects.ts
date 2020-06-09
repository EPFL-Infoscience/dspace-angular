import { Injectable } from '@angular/core';
import { of as observableOf } from 'rxjs';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import {
  RetrieveSetsBySignatureAction,
  RetrieveSetsBySignatureErrorAction,
  DeduplicationSetsActions,
  DeduplicationSetsActionTypes,
} from './deduplication-sets.actions';
import { Store } from '@ngrx/store';
import { DeduplicationRestService } from '../../core/deduplication/deduplication-rest.service';

/**
 * Provides effect methods for jsonPatch Operations actions.
 */
@Injectable()
export class DeduplicationSetsEffects {

  /**
   * Retrieve all deduplication signatures.
   */
  @Effect() retrieveObjectsBySignature$ = this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE),
    switchMap(() => {
      return this.deduplicationService.getSignatures().pipe(
        map((objects: any) => {
          const a = 1;
        }),
        catchError((error: Error) => {
          if (error) {
            console.error(error.message);
          }
          return observableOf(new RetrieveSetsBySignatureErrorAction())
        }));
    }));

    constructor(
      private actions$: Actions,
      private store$: Store<any>,
      private deduplicationService: DeduplicationRestService
    ) {
    }
}
