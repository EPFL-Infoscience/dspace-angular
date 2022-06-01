import { SetObject } from 'src/app/core/deduplication/models/set.model';
import { PaginatedList } from './../../core/data/paginated-list.model';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { Injectable } from '@angular/core';
import { of as observableOf } from 'rxjs';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import {
  RetrieveSetsBySignatureAction,
  RetrieveSetsBySignatureErrorAction,
  DeduplicationSetsActions,
  DeduplicationSetsActionTypes,
  AddSetsAction,
} from './deduplication-sets.actions';
import { Store } from '@ngrx/store';
import { DeduplicationRestService } from '../../core/deduplication/deduplication-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { DeduplicationState } from '../deduplication.reducer';
import { DeduplicationSetsService } from './deduplication-sets.service';

/**
 * Provides effect methods for jsonPatch Operations actions.
 */
@Injectable()
export class DeduplicationSetsEffects {

  /**
   * Retrieve all deduplication signatures.
   */
  // @Effect() retrieveObjectsBySignature$ = this.actions$.pipe(
  //   ofType(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE),
  //   switchMap(() => {
  //     return this.deduplicationService.getSignatures().pipe(
  //       map((objects: any) => {
  //         const a = 1;
  //       }),
  //       catchError((error: Error) => {
  //         if (error) {
  //           console.error(error.message);
  //         }
  //         return observableOf(new RetrieveSetsBySignatureErrorAction())
  //       }));
  //   }));

    @Effect() retrieveAllSets$ = this.actions$.pipe(
      tap((x)=>{
        console.log(x);
        console.log(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE);

      }),
      ofType(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE),
      withLatestFrom(this.store$),
      switchMap(([action, currentState]: [RetrieveSetsBySignatureAction, any]) => {
        const currentPage = (currentState.deduplication as DeduplicationState).sets.currentPage + 1;

debugger
        return this.deduplicationSetsService.getSets(action.payload.elementsPerPage, currentPage , action.payload.signatureId)
        .pipe(
          map((sets: PaginatedList<SetObject>) =>
          new AddSetsAction(sets.page, sets.totalPages, sets.currentPage, sets.totalElements, action.payload.signatureId)
       ),
          catchError((error: Error) => {
            if (error) {
              console.error(error.message);
            }
            return observableOf(new RetrieveSetsBySignatureErrorAction());
          })
        );
      })
    );

      /**
   * Show a notification on error.
   */
  @Effect({ dispatch: false }) retrieveAllSetsErrorAction$ = this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE_ERROR),
    tap(() => {
      this.notificationsService.error(null, this.translate.get('deduplication.signature.error.service.retrieve'));
    })
  );

    constructor(
      private actions$: Actions,
      private store$: Store<any>,
      private deduplicationService: DeduplicationRestService,
      private notificationsService: NotificationsService,
      private translate: TranslateService,
      private deduplicationSetsService : DeduplicationSetsService
    ) {
    }
}
