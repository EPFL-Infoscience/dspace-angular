import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { of as observableOf } from 'rxjs';
import {
  RetrieveAllSignaturesAction,
  RetrieveAllSignaturesErrorAction,
  DeduplicationSignaturesActionTypes,
  AddSignaturesAction
} from './deduplication-signatures.actions';

import { SignatureObject } from '../../core/deduplication/models/signature.model';
import { PaginatedList } from '../../core/data/paginated-list';
import { DeduplicationSignaturesService } from './deduplication-signatures.service';
import { DeduplicationState } from '../deduplication.reducer';
import { NotificationsService } from '../../shared/notifications/notifications.service';

/**
 * Provides effect methods for the Signatures actions.
 */
@Injectable()
export class DeduplicationSignaturesEffects {

  /**
   * Retrieve all deduplication signatures managing pagination and errors.
   */
  @Effect() retrieveAllSignatures$ = this.actions$.pipe(
    ofType(DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES),
    withLatestFrom(this.store$),
    switchMap(([action, currentState]: [RetrieveAllSignaturesAction, any]) => {
      const currentPage = (currentState.deduplication as DeduplicationState).signatures.currentPage + 1;
      return this.deduplicationSignaturesService.getSignatures(action.payload.elementsPerPage, currentPage).pipe(
        map((signatures: PaginatedList<SignatureObject>) =>
          new AddSignaturesAction(signatures.page, signatures.totalPages, signatures.currentPage, signatures.totalElements)
        ),
        catchError((error: Error) => {
          if (error) {
            console.error(error.message);
          }
          return observableOf(new RetrieveAllSignaturesErrorAction())
        })
      )
    })
  );

  /**
   * Show a notification on error.
   */
  @Effect({ dispatch: false }) retrieveAllSignaturesErrorAction$ = this.actions$.pipe(
    ofType(DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES_ERROR),
    tap(() => {
      this.notificationsService.error(null, this.translate.get('deduplication.signature.error.service.retrieve'))
    })
  );

  /**
   * Initialize the effect class variables.
   * @param {Actions} actions$
   * @param {Store<any>} store$
   * @param {NotificationsService} notificationsService
   * @param {DeduplicationSignaturesService} deduplicationSignaturesService
   */
  constructor(
    private actions$: Actions,
    private store$: Store<any>,
    private translate: TranslateService,
    private notificationsService: NotificationsService,
    private deduplicationSignaturesService: DeduplicationSignaturesService
  ) { }
}
