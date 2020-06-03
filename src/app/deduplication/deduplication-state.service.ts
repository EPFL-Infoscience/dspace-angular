import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppState } from '../app.reducer';
import {
  signaturesObjectSelector,
  isDeduplicationSignaturesLoadedSelector,
} from './selectors';
import { DeduplicationSignatureState } from './signatures/deduplication-signatures.reducer';

@Injectable()
export class DeduplicationStateService {
  constructor(private store: Store<AppState>) {

  }

  public getDeduplicationSignatures() {
    return this.store.pipe(select(signaturesObjectSelector));
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

  public dispatchRetrieveDeduplicationSignatures(): void {
    this.store.dispatch(new RetrieveAllWorkpackagesAction(null))
  }
}
