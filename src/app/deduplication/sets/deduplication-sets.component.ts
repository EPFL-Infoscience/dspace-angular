import { hasValue } from 'src/app/shared/empty.util';
import { MetadataMap } from './../../core/shared/metadata.models';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { SetItemsObject } from './../../core/deduplication/models/set-items.model';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SetObject } from '../../core/deduplication/models/set.model';
import { DeduplicationStateService } from '../deduplication-state.service';
import { map, take } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeduplicationSetsService } from './deduplication-sets.service';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { isEqual } from 'lodash';

@Component({
  selector: 'ds-deduplication-sets',
  templateUrl: './deduplication-sets.component.html',
  styleUrls: ['./deduplication-sets.component.scss'],
})
export class DeduplicationSetsComponent implements OnInit, AfterViewInit {

  public sets$: Observable<SetObject[]>;

  public itemsMap: Map<string, Observable<SetItemsObject[]>> = new Map();

  public signatureId: string;

  public rule: string;

  protected elementsPerPage = 5;

  public totalPages$: Observable<number>;

  public currentPage$: Observable<number>;

  public totalElements$: Observable<number>;

  constructor(
    private route: ActivatedRoute,
    private deduplicationStateService: DeduplicationStateService,
    private modalService: NgbModal,
    private deduplicationSetsService: DeduplicationSetsService,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
  ) {
    this.signatureId = this.route.snapshot.params.id;
    this.rule = this.route.snapshot.params.rule;

    this.sets$ =
      this.deduplicationStateService.getDeduplicationSetsPerSignature();
    this.totalPages$ =
      this.deduplicationStateService.getDeduplicationSetsTotalPages();
    this.currentPage$ =
      this.deduplicationStateService.getDeduplicationSetsCurrentPage();
    this.totalElements$ =
      this.deduplicationStateService.getDeduplicationSetsTotals();
  }

  ngOnInit(): void { }

  /**
   * First deduplication sets loading after view initialization.
   */
  ngAfterViewInit(): void {
    this.deduplicationStateService
      .isDeduplicationSetsLoaded()
      .pipe(take(1))
      .subscribe(() => {
        this.retrieveDeduplicationSets();
        this.getAllItems();
      });
  }

  retrieveDeduplicationSets() {
    this.deduplicationStateService.dispatchRetrieveDeduplicationSetsBySignature(
      this.signatureId,
      this.rule,
      this.elementsPerPage
    );
  }

  public isSetsLoading(): Observable<boolean> {
    return this.deduplicationStateService.isDeduplicationSetsLoading();
  }

  getAllItems() {
    this.sets$
      .pipe(
        map((sets: SetObject[]) => {
          sets.forEach((set) => {
            this.deduplicationStateService.dispatchRetrieveDeduplicationSetItems(
              set.id
            );
            const items$: Observable<SetItemsObject[]> =
              this.deduplicationStateService.getDeduplicationSetItems();
            this.itemsMap.set(set.id, items$);
          });
        })
      )
      .subscribe();
  }

  getItemsPerSet(setId: string): Observable<SetItemsObject[]> {
    return this.itemsMap.has(setId) ? this.itemsMap.get(setId) : of([]);
  }

  getAuthor(metadata: MetadataMap):string {
    if(metadata){
         let author = metadata['dc.contributor.author'];
     return hasValue( author)? author[0].value : '-';
    }
  }

  getDateIssued(metadata: MetadataMap):string {
    if(metadata){
    let author = metadata['dc.date.issued'];
     return hasValue( author)? author[0].value : '-';
    }
  }

  getItemIds(setId: string): Observable<string[]> {
    if (this.itemsMap.has(setId)) {
      return this.itemsMap.get(setId).pipe(
        map((item: SetItemsObject[]) => {
          return item.map((x) => x.id);
        })
      );
    }
  }

  deleteSet(setId: string) {
    this.deduplicationSetsService.deleteSet(this.signatureId).subscribe((res: RemoteData<NoContent>) => {
      if (res.hasSucceeded) {
        this.deduplicationStateService.dispatchDeleteSet(this.signatureId, setId);
      } else {
        this.notificationsService.error(null, this.translate.get('Cannot remove set'))
      }
    })
  }

  deleteItem(itemId: string) {
    this.deduplicationSetsService.deleteItem(this.signatureId, itemId).subscribe((res: RemoteData<NoContent>) => {
      if (res.hasSucceeded) {
        this.deduplicationStateService.dispatchDeleteItem(this.signatureId, itemId);
      } else {
        this.notificationsService.error(null, this.translate.get('Cannot remove item'))
      }
    })
  }

  public confirmDelete(content, elementId: string, element: 'item' | 'set') {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'ok') {
          if (isEqual(element, 'set')) {
            this.deleteSet(elementId);
          } else {
            this.deleteItem(elementId);
          }
        }
      }
    );
  }
}
