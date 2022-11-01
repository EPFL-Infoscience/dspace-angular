import { Item } from './../../core/shared/item.model';
import { getAllSucceededRemoteListPayload } from './../../core/shared/operators';
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
  RemoveItemPerSetAction,
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
   * Retrieve all items per set.
   */
  @Effect() retrieveAllSets$ = this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE),
    withLatestFrom(this.store$),
    switchMap(([action, currentState]: [RetrieveSetsBySignatureAction, any]) => {
      const currentPage = (currentState.deduplication as DeduplicationState).sets.currentPage + 1;
      return this.deduplicationSetsService.getSets(action.payload.elementsPerPage, currentPage, action.payload.signatureId, action.payload.rule)
        .pipe(
          map((sets: PaginatedList<SetObject>) => {
            const payload: SetObject[] = sets.page.map((set: SetObject) => {
              set.items.pipe(
                getAllSucceededRemoteListPayload(),
              ).subscribe((items: Item[]) => {
                set = Object.assign(new SetObject, {
                  ...set,
                  itemsList: items
                });
              });
              return set;
            });

            return new AddSetsAction(payload, sets.totalPages, sets.currentPage, sets.totalElements, action.payload.signatureId, action.payload.rule);
          }),
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

  @Effect({ dispatch: false }) removeItemPerSetAction$ = this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.DELETE_ITEM_PER_SET),
    withLatestFrom(this.store$),
    tap((res: [RemoveItemPerSetAction, any]) =>
      new RemoveItemPerSetAction(res[0].payload.signatureId, res[0].payload.setId, res[0].payload.rule, res[0].payload.itemId)
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
