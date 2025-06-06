import isEqual from 'lodash/isEqual';
import { Item } from '../../core/shared/item.model';
import { getAllSucceededRemoteListPayload } from '../../core/shared/operators';
import { SetObject } from '../../core/deduplication/models/set.model';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';

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
  retrieveAllSets$ = createEffect(() => this.actions$.pipe(
    ofType(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE),
    withLatestFrom(this.store$),
    switchMap(([action, currentState]: [RetrieveSetsBySignatureAction, any]) => {
      const currentPage = action.payload.skipToNextPage ? (currentState.deduplication as DeduplicationState).sets.currentPage + 1
      : (currentState.deduplication as DeduplicationState).sets.currentPage;
      return this.deduplicationSetsService.getSets(action.payload.elementsPerPage, currentPage, action.payload.signatureId, action.payload.rule)
        .pipe(
          mergeMap((sets: PaginatedList<SetObject>) => {
            const setArray$: Observable<SetObject>[] = sets.page.map((set: SetObject) => {
              // getting sets and items per set, since items are of the type RD paginated list we flat the nested observables
              // and store the sets with the correspondent array of items
              const set$: Observable<SetObject> = set.items.pipe(
                getAllSucceededRemoteListPayload(),
                map((items: Item[]) => Object.assign(new SetObject(), { ...set, itemsList: items ?? [] }) as SetObject),
              );
              return set$;
            });

            if (isEqual(setArray$.length, 0)) {
              // in case there are no sets we add an empty array to the store
              let addAction = new AddSetsAction([], sets.totalPages, currentPage, sets.totalElements, action.payload.signatureId, action.payload.rule, action.payload.skipToNextPage);
              return observableOf(addAction);
            }

            return combineLatest(setArray$).pipe(
              map((payload: SetObject[]) => {
                return new AddSetsAction(payload, sets.totalPages, currentPage, sets.totalElements, action.payload.signatureId, action.payload.rule, action.payload.skipToNextPage);
              }),
            );
          }),
          catchError((error: Error) => {
            if (error) {
              console.error(error.message);
            }
            return observableOf(new RetrieveSetsBySignatureErrorAction());
          })
        );
    })
  ));

  /**
   * Show a notification on error.
   */
  retrieveAllSetsErrorAction$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DeduplicationSetsActionTypes.RETRIEVE_SETS_BY_SIGNATURE_ERROR),
        tap(() => {
          this.notificationsService.error(null, this.translate.get('deduplication.sets.notification.cannot-get-set'));
        })
      ),
    { dispatch: false }
  );

  removeSetsAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DeduplicationSetsActionTypes.REMOVE_SETS),
      withLatestFrom(this.store$),
      tap((res: [RemoveSetsAction, any]) =>
        new RemoveSetsAction(res[0].payload.signatureId, res[0].payload.rule)
      )
    ),
    { dispatch: false }
  );

  removeItemPerSetAction$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DeduplicationSetsActionTypes.DELETE_ITEM_PER_SET),
        withLatestFrom(this.store$),
        tap((res: [RemoveItemPerSetAction, any]) =>
          new RemoveItemPerSetAction(res[0].payload.signatureId, res[0].payload.setId, res[0].payload.rule, res[0].payload.itemId, res[0].payload.deleteMode)
        )
      ),
{ dispatch: false }
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
