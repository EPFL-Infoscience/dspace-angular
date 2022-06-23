import { SetItemsObject } from './../../core/deduplication/models/set-items.model';
import { Observable } from 'rxjs/internal/Observable';
import { DeduplicationStateService } from './../deduplication-state.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'ds-deduplication-merge',
  templateUrl: './deduplication-merge.component.html',
  styleUrls: ['./deduplication-merge.component.scss']
})
export class DeduplicationMergeComponent implements OnInit, OnDestroy {

  itemsToCompare$: Observable<SetItemsObject[]>;

  constructor(private deduplicationStateService: DeduplicationStateService) {
    this.itemsToCompare$ = this.deduplicationStateService.getItemsToCompare();
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    // Remove the items from store
    this.deduplicationStateService.dispatchRemoveItemsToCompare();
  }
}
