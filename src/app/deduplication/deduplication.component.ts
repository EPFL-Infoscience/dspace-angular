import { Observable } from 'rxjs';
import { DeduplicationStateService } from './deduplication-state.service';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { take } from 'rxjs/operators';


/**
 * Component to display the deduplication signatures page.
 */
@Component({
  selector: 'ds-deduplication',
  templateUrl: './deduplication.component.html',
  styleUrls: ['./deduplication.component.scss'],
})
export class DeduplicationComponent implements OnInit, AfterViewInit {
  /**
   * The number of deduplication signatures per page.
   */
  public elementsPerRow = 3;

  /**
   * The deduplication signatures list.
   */
  public signatures$: Observable<SignatureObject[]>;

  constructor(
    private deduplicationStateService: DeduplicationStateService,
  ) { }

  /**
   * Component intitialization.
   */
  ngOnInit(): void {
    this.signatures$ =
      this.deduplicationStateService.getDeduplicationSignatures();
  }

  /**
   * First deduplication signatures loading after view initialization.
   */
  ngAfterViewInit(): void {
    this.deduplicationStateService
      .isDeduplicationSignaturesLoaded()
      .pipe(take(1))
      .subscribe(() => {
        this.addMoreDeduplicationSignatures();
      });
  }

  /**
   * Returns the information about the loading status of the signatures (if it's running or not).
   *
   * @return Observable<boolean>
   *    'true' if the signatures are loading, 'false' otherwise.
   */
  public isSignaturesLoading(): Observable<boolean> {
    return this.deduplicationStateService.isDeduplicationSignaturesLoading();
  }

  /**
   * Retrieve more deduplication signatures from the server.
   */
  public addMoreDeduplicationSignatures(): void {
    this.deduplicationStateService.dispatchRetrieveDeduplicationSignatures();
  }
}

