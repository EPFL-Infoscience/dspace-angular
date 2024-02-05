import { FindListOptions } from '../../core/data/find-list-options.model';
import { SortDirection, SortOptions } from '../../core/cache/models/sort-options.model';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { of as observableOf } from 'rxjs';
import {
  AddSignaturesAction,
  DeduplicationSignaturesActionTypes,
  RetrieveAllSignaturesAction,
  RetrieveAllSignaturesErrorAction
} from './signature-component/deduplication-signatures.actions';

import { SignatureObject } from '../../core/deduplication/models/signature.model';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { DeduplicationSignaturesService } from './deduplication-signatures.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';

/**
 * Provides effect methods for the Signatures actions.
 */
@Injectable()
export class DeduplicationSignaturesEffects {

  /**
   * Retrieve all deduplication signatures managing pagination and errors.
   */
  retrieveAllSignatures$ = createEffect(() => this.actions$.pipe(
    ofType(DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES),
    withLatestFrom(this.store$),
    switchMap(([action, currentState]: [RetrieveAllSignaturesAction, any]) => {
      const sortOptions = new SortOptions('signatureType', SortDirection.ASC);
      const findListOptions: FindListOptions = {
        sort: sortOptions
      };
      return this.deduplicationSignaturesService.getSignatures(findListOptions)
      .pipe(
        map((signatures: PaginatedList<SignatureObject>) =>
           new AddSignaturesAction(signatures.page, signatures.totalPages, signatures.currentPage, signatures.totalElements)
        ),
        catchError((error: Error) => {
          if (error) {
            console.error(error.message);
          }
          return observableOf(new RetrieveAllSignaturesErrorAction());
        })
      );
    })
  ));

  /**
   * Show a notification on error.
   */
   retrieveAllSignaturesErrorAction$ = createEffect(() => this.actions$.pipe(
    ofType(DeduplicationSignaturesActionTypes.RETRIEVE_ALL_SIGNATURES_ERROR),
    tap(() => {
      this.notificationsService.error(null, this.translate.get('deduplication.signature.error.service.retrieve'));
    })), { dispatch: false });

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
