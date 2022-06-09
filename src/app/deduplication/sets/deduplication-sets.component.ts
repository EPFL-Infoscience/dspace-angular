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

  /**
   * The deduplication signatures' sets list.
   * @type {Observable<SetObject[]>}
   */
  public sets$: Observable<SetObject[]>;

  /**
   * Stores all items per set.
   * @type {Map<string, Observable<SetItemsObject[]>>}
   */
  public itemsMap: Map<string, Observable<SetItemsObject[]>> = new Map();

  /**
   * The id of the signature to which the sets belong to.
   * @type {string}
   */
  public signatureId: string;

  /**
   * Refers to sets pending submitter check
   * @type {string}
   */
  public rule: string;

  /**
   * The number of elements per page.
   * @protected
   */
  protected elementsPerPage = 5;

  /**
   * The signatures' sets total pages.
   */
  public setsTotalPages$: Observable<number>;

  /**
   * The sets current page.
   */
  public setCurrentPage$: Observable<number>;

  /**
   * The sets total elements.
   */
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
    this.setsTotalPages$ =
      this.deduplicationStateService.getDeduplicationSetsTotalPages();
    this.setCurrentPage$ =
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

  /**
   * Retrieves the deduplication sets.
   */
  retrieveDeduplicationSets() {
    this.deduplicationStateService.dispatchRetrieveDeduplicationSetsBySignature(
      this.signatureId,
      this.rule,
      this.elementsPerPage
    );
  }

  /**
   *  Returns the information about the loading status of the sets (if it's running or not).
   * @returns {Observable<boolean>}
   */
  public isSetsLoading(): Observable<boolean> {
    return this.deduplicationStateService.isDeduplicationSetsLoading();
  }

  /**
   * Retrieves the items per set.
   */
  getAllItems() {
    this.sets$
      .subscribe((sets: SetObject[]) => {
        sets.forEach((set) => {
          this.deduplicationStateService.dispatchRetrieveDeduplicationSetItems(
            set.id
          );
          const items$: Observable<SetItemsObject[]> =
            this.deduplicationStateService.getDeduplicationSetItems();
          this.itemsMap.set(set.id, items$);
        });
      });
  }

  /**
   * Retrieves the items per set from the Map
   * @param setId The id of the set to which the items belong to.
   * @returns {Observable<SetItemsObject[]>}
   */
  getItemsPerSet(setId: string): Observable<SetItemsObject[]> {
    return this.itemsMap.has(setId) ? this.itemsMap.get(setId) : of([]);
  }

  /**
   * Returns the item's author.
   * @param metadata The metadata of the item
   * @returns {string} The value or a missing value if the metadata is not defined
   */
  getAuthor(metadata: MetadataMap): string {
    if (metadata) {
      let author = metadata['dc.contributor.author'];
      return hasValue(author) ? author[0].value : '-';
    }
  }

  /**
   * Returns the item's date issued.
   * @param metadata The metadata of the item
   * @returns  {string} The value or a missing value if the metadata is not defined
   */
  getDateIssued(metadata: MetadataMap): string {
    if (metadata) {
      let author = metadata['dc.date.issued'];
      return hasValue(author) ? author[0].value : '-';
    }
  }

  /**
   * Returns the item's ids.
   * @param setId The id of the set to which the items belong to.
   * @returns { Observable<string[]>}
   */
  getItemIds(setId: string): Observable<string[]> {
    if (this.itemsMap.has(setId)) {
      return this.itemsMap.get(setId).pipe(
        map((item: SetItemsObject[]) => {
          return item.map((x) => x.id);
        })
      );
    }
  }

  /**
   * Delete the set.
   * @param setId The id of the set to which the items belong to.
   */
  deleteSet(setId: string) {
    this.deduplicationSetsService.deleteSet(this.signatureId).subscribe((res: RemoteData<NoContent>) => {
      if (res.hasSucceeded) {
        this.deduplicationStateService.dispatchDeleteSet(this.signatureId, setId);
      } else {
        this.notificationsService.error(null, this.translate.get('Cannot remove set'))
      }
    })
  }

  /**
   * Delete the item.
   * @param itemId The id of the item to be deleted
   */
  deleteItem(itemId: string) {
    this.deduplicationSetsService.deleteItem(this.signatureId, itemId).subscribe((res: RemoteData<NoContent>) => {
      if (res.hasSucceeded) {
        this.deduplicationStateService.dispatchDeleteItem(this.signatureId, itemId);
      } else {
        this.notificationsService.error(null, this.translate.get('Cannot remove item'))
      }
    })
  }

  /**
   * Confirms the deletion of the set | item.
   * @param content The modal content
   * @param elementId itemId | setId (based on situation)
   * @param element 'item' | 'set' (identifier for the element to be deleted)
   */
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
