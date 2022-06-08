import { SetItemsObject } from './../../core/deduplication/models/set-items.model';
import { SetObject } from 'src/app/core/deduplication/models/set.model';
import { PaginatedList } from './../../core/data/paginated-list.model';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { Injectable } from '@angular/core';
import { of as observableOf } from 'rxjs';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import {
  RetrieveSetsBySignatureAction,
  RetrieveSetsBySignatureErrorAction,
  DeduplicationSetsActionTypes,
  AddSetsAction,
  RetrieveSetItemsAction,
  RetrieveSetItemsErrorAction,
  AddSetItemsAction,
} from './deduplication-sets.actions';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { DeduplicationState } from '../deduplication.reducer';
import { DeduplicationSetsService } from './deduplication-sets.service';

/**
 * Provides effect methods for jsonPatch Operations actions.
 */
@Injectable()
export class DeduplicationSetsEffects {

  @Effect() retrieveAllSets$ = this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE),
    withLatestFrom(this.store$),
    switchMap(([action, currentState]: [RetrieveSetsBySignatureAction, any]) => {
      const currentPage = (currentState.deduplication as DeduplicationState).sets.currentPage + 1;
      return this.deduplicationSetsService.getSets(action.payload.elementsPerPage, currentPage, action.payload.signatureId, action.payload.rule)
        .pipe(
          map((sets: PaginatedList<SetObject>) =>
            new AddSetsAction(sets.page, sets.totalPages, sets.currentPage, sets.totalElements, action.payload.signatureId, action.payload.rule)
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
      this.notificationsService.error(null, this.translate.get('Cannot get sets'));
    })
  );

  @Effect() retrieveAllSetItems$ = this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.RETRIEVE_ALL_SET_ITEMS),
    withLatestFrom(this.store$),
    switchMap(([action, currentState]: [RetrieveSetItemsAction, any]) => {
      return this.deduplicationSetsService.getSetItems(action.payload.setId)
        .pipe(
          map((items: PaginatedList<SetItemsObject>) =>
            new AddSetItemsAction(items.page, action.payload.setId)
          ),
          catchError((error: Error) => {
            if (error) {
              console.error(error.message);
            }
            return observableOf(new RetrieveSetItemsErrorAction());
          })
        );
    })
  );

  /**
* Show a notification on error.
*/
  @Effect({ dispatch: false }) retrieveAllSetItemsErrorAction$ = this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.RETRIEVE_ALL_SET_ITEMS_ERROR),
    tap(() => {
      this.notificationsService.error(null, this.translate.get('Cannot get items'));
    })
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
