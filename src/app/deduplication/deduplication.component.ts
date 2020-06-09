import { Component, OnInit } from '@angular/core';
import { take, map } from 'rxjs/operators';
import { Observable, of, combineLatest } from 'rxjs';
import { DeduplicationStateService } from './deduplication-state.service';
import { SignatureObject } from '../core/deduplication/models/signature.model';

/**
 * Component to display the deduplication signatures page.
 */
@Component({
  selector: 'ds-deduplication',
  templateUrl: './deduplication.component.html',
  styleUrls: ['./deduplication.component.scss'],
})
export class DeduplicationComponent implements OnInit {
  /**
   * The number of deduplication signatures per page.
   */
  public elementsPerPage = 3;

  /**
   * The deduplication signatures list.
   */
  public signatures$: Observable<SignatureObject[]>;

  /**
   * The deduplication signatures total pages.
   */
  public totalPages$: Observable<number>;

  /**
   * The deduplication signatures current page.
   */
  public currentPage$: Observable<number>;

  /**
   * The total number of deduplication signatures.
   */
  public totalElements$: Observable<number>;

  /**
   * The number of deduplication signatures not yet loaded.
   */
  public totalRemainingElements: number;

  /**
   * Initialize the component variables.
   * @param {DeduplicationStateService} deduplicationStateService
   */
  constructor(
    private deduplicationStateService: DeduplicationStateService
  ) { }

  /**
   * Component intitialization.
   */
  ngOnInit(): void {
    this.signatures$ = this.deduplicationStateService.getDeduplicationSignatures();
    this.totalPages$ = this.deduplicationStateService.getDeduplicationSignaturesTotalPages();
    this.currentPage$ = this.deduplicationStateService.getDeduplicationSignaturesCurrentPage();
    this.totalElements$ = this.deduplicationStateService.getDeduplicationSignaturesTotals();
    this.totalRemainingElements = 0;
  }

  /**
   * First deduplication signatures loading after view initialization.
   */
  ngAfterViewInit(): void {
    this.deduplicationStateService.isDeduplicationSignaturesLoaded().pipe(
      take(1)
    ).subscribe(() => {
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
   * Returns the information about the processing status of the signatures (if it's running or not).
   *
   * @return Observable<boolean>
   *    'true' if there are operations running on the signatures (ex.: a REST call), 'false' otherwise.
   */
  public isSignaturesProcessing(): Observable<boolean> {
    return this.deduplicationStateService.isDeduplicationSignaturesProcessing();
  }

  /**
   * Used to know if the 'show more' button should be enabled or disabled.
   *
   * @return Observable<boolean>
   *    'true' if there are more pages to load, 'false' otherwise.
   */
  public showMoreButton(): Observable<boolean> {
    return combineLatest([ this.totalPages$, this.currentPage$, this.totalElements$ ]).pipe(
      map(([totalPages, currentPage, totalElements]) => {
        let output: boolean;
        if (totalPages < 2 || totalPages === currentPage + 1) {
          output = false;
        } else {
          output = true;
        }
        const totalShowElements = (currentPage + 1) * this.elementsPerPage;
        if (totalShowElements > totalElements) {
          this.totalRemainingElements = 0;
        } else {
          this.totalRemainingElements = totalElements - totalShowElements;
        }
        return output;
      })
    );
  }

  /**
   * Retrieve more deduplication signatures from the server.
   */
  public addMoreDeduplicationSignatures(): void {
    this.deduplicationStateService.dispatchRetrieveDeduplicationSignatures(this.elementsPerPage);
  }
}
