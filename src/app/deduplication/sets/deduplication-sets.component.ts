import { SetItemsObject } from './../../core/deduplication/models/set-items.model';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SetObject } from '../../core/deduplication/models/set.model';
import { DeduplicationStateService } from '../deduplication-state.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ds-deduplication-sets',
  templateUrl: './deduplication-sets.component.html',
  styleUrls: ['./deduplication-sets.component.scss'],
})
export class DeduplicationSetsComponent implements OnInit, AfterViewInit {

  public sets$: Observable<SetObject[]>;

  public items$: Observable<SetItemsObject[]>;

  public signatureId: string;

  public rule: string;

  protected elementsPerPage = 5;

  public totalPages$: Observable<number>;

  public currentPage$: Observable<number>;

  public totalElements$: Observable<number>;


  constructor(private route: ActivatedRoute, private deduplicationStateService: DeduplicationStateService) {
    this.signatureId = this.route.snapshot.params.id;
    this.rule = this.route.snapshot.params.rule;

    this.sets$ = this.deduplicationStateService.getDeduplicationSetsPerSignature();
    this.totalPages$ = this.deduplicationStateService.getDeduplicationSetsTotalPages();
    this.currentPage$ = this.deduplicationStateService.getDeduplicationSetsCurrentPage();
    this.totalElements$ = this.deduplicationStateService.getDeduplicationSetsTotals();

    this.items$ = this.deduplicationStateService.getDeduplicationSetItems();
  }

  ngOnInit(): void { }

  /**
 * First deduplication sets loading after view initialization.
 */
  ngAfterViewInit(): void {
    this.deduplicationStateService.isDeduplicationSetsLoaded().pipe(
      take(1)
    ).subscribe(() => {
      this.retrieveDeduplicationSets();
    });

    this.deduplicationStateService.dispatchRetrieveDeduplicationSetItems('title:076e72f48064a2023bff60688785a37a', this.elementsPerPage);
  }

  retrieveDeduplicationSets() {
    this.deduplicationStateService.dispatchRetrieveDeduplicationSetsBySignature(this.signatureId, this.rule, this.elementsPerPage);
  }

  public isSetsLoading(): Observable<boolean> {
    return this.deduplicationStateService.isDeduplicationSetsLoading();
  }

}
