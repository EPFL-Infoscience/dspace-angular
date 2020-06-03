import { Component } from '@angular/core';
import { take } from 'rxjs/operators';
import { DeduplicationStateService } from './deduplication-state.service';
import { Observable } from 'rxjs';
import { SignatureObject } from '../core/deduplication/models/signature.model';

@Component({
  selector: 'ds-deduplication',
  templateUrl: './deduplication.component.html',
  styleUrls: ['./deduplication.component.scss'],
})
export class DeduplicationComponent {

  constructor(
    // private workingPlanService: WorkingPlanService,
    private deduplicationStateService: DeduplicationStateService
  ) { }

  ngAfterViewInit(): void {
    this.deduplicationStateService.isDeduplicationSignaturesLoaded().pipe(
      take(1)
    ).subscribe(() => {
      this.deduplicationStateService.dispatchRetrieveDeduplicationSignatures();
    })
  }

  public isSignaturesLoading(): Observable<boolean> {
    return this.deduplicationStateService.isDeduplicationSignaturesLoading();
  }

  public getDeduplicationSignatures(): Observable<SignatureObject[]> {
    return this.deduplicationStateService.getDeduplicationSignatures();
  }
}
