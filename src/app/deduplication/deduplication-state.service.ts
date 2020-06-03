import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppState } from '../app.reducer';
import {
  signaturesObjectSelector,
  isDeduplicationSignaturesLoadedSelector,
  isDeduplicationSignaturesProcessingSelector,
} from './selectors';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { DeduplicationState } from './deduplication.reducer';
import { RetrieveAllSignaturesAction } from './signatures/deduplication-signatures.actions';

@Injectable()
export class DeduplicationStateService {
  constructor(private store: Store<DeduplicationState>) { }

  public getDeduplicationSignatures(): Observable<SignatureObject[]> {
    return this.store.pipe(select(signaturesObjectSelector()));
  }

  public isDeduplicationSignaturesLoading(): Observable<boolean> {
    return this.store.pipe(
      select(isDeduplicationSignaturesLoadedSelector),
      map((loaded: boolean) => !loaded)
    );
  }

  public isDeduplicationSignaturesLoaded(): Observable<boolean> {
    return this.store.pipe(select(isDeduplicationSignaturesLoadedSelector));
  }

  public isDeduplicationSignaturesProcessing(): Observable<boolean> {
    return this.store.pipe(
      select(isDeduplicationSignaturesProcessingSelector),
      map((loaded: boolean) => !loaded)
    );
  }

  public dispatchRetrieveDeduplicationSignatures(elementsPerPage: number): void {
    this.store.dispatch(new RetrieveAllSignaturesAction(elementsPerPage))
  }
}
