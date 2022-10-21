import { SetObject } from './../../core/deduplication/models/set.model';
import { PaginatedList } from './../../core/data/paginated-list.model';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { Injectable } from '@angular/core';
import { of as observableOf } from 'rxjs';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import {
  RetrieveSetsBySignatureAction,
  RetrieveSetsBySignatureErrorAction,
  DeduplicationSetsActionTypes,
  AddSetsAction,
  RemoveSetsAction,
} from './deduplication-sets.actions';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { DeduplicationSetsService } from './deduplication-sets.service';
import { DeduplicationState } from '../deduplication.reducer';

/**
 * Provides effect methods for jsonPatch Operations actions.
 */
@Injectable()
export class DeduplicationSetsEffects {

  /**
   * Retrieve all deduplication sets per signature managing pagination and errors.
   */
  @Effect() retrieveAllSets$ = this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE),
    withLatestFrom(this.store$),
    switchMap(([action, currentState]: [RetrieveSetsBySignatureAction, any]) => {
      const currentPage = (currentState.deduplication as DeduplicationState).sets.currentPage + 1;
      return this.deduplicationSetsService.getSets(action.payload.elementsPerPage, currentPage, action.payload.signatureId, action.payload.rule)
        .pipe(
          map((sets: PaginatedList<SetObject>) =>
            new AddSetsAction(sets.page, sets.totalPages, sets.currentPage, sets.totalElements, action.payload.signatureId, action.payload.rule, action.payload.skipToNextPage)
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
      this.notificationsService.error(null, this.translate.get('deduplication.sets.notification.cannot-get-set'));
    })
  );

  @Effect({ dispatch: false }) removeSetsAction$ = this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.REMOVE_SETS),
    withLatestFrom(this.store$),
    tap((res: [RemoveSetsAction, any]) =>
      new RemoveSetsAction(res[0].payload.signatureId, res[0].payload.rule)
    )
  );

  constructor(
    private actions$: Actions,
    private store$: Store<any>,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    private deduplicationSetsService: DeduplicationSetsService
  ) {
  }
}
