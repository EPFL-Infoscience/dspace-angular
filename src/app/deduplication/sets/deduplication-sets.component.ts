import { Collection } from './../../core/shared/collection.model';
import { FeatureID } from './../../core/data/feature-authorization/feature-id';
import { AuthorizationDataService } from './../../core/data/feature-authorization/authorization-data.service';
import { hasValue } from 'src/app/shared/empty.util';
import { MetadataMap } from './../../core/shared/metadata.models';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { SetItemsObject } from './../../core/deduplication/models/set-items.model';
import { ActivatedRoute } from '@angular/router';
import { Component, AfterViewInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SetObject } from '../../core/deduplication/models/set.model';
import { DeduplicationStateService } from '../deduplication-state.service';
import { map, take } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeduplicationSetsService } from './deduplication-sets.service';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { isEqual } from 'lodash';
import {
  getFirstCompletedRemoteData,
  getRemoteDataPayload,
} from 'src/app/core/shared/operators';

@Component({
  selector: 'ds-deduplication-sets',
  templateUrl: './deduplication-sets.component.html',
  styleUrls: ['./deduplication-sets.component.scss'],
})
export class DeduplicationSetsComponent implements AfterViewInit {
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

  /**
   * Role of the logged in user.
   * @type {Observable<boolean>}
   */
  public isAdmin$: Observable<boolean>;

  /**
   * Stores the checked items per set.
   * @type {Map<string, SelectedItemData[]>}
   */
  checkedItemsList: Map<string, SelectedItemData[]> = new Map();

  constructor(
    private route: ActivatedRoute,
    private deduplicationStateService: DeduplicationStateService,
    private modalService: NgbModal,
    private deduplicationSetsService: DeduplicationSetsService,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    private authorizationService: AuthorizationDataService
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
    this.isAdmin$ = this.isCurrentUserAdmin();
  }

  /**
   * First deduplication sets loading after view initialization.
   */
  ngAfterViewInit(): void {
    this.deduplicationStateService
      .isDeduplicationSetsLoaded()
      .pipe(take(1))
      .subscribe(() => {
        this.retrieveDeduplicationSets();
      });
  }

  /**
   * Retrieves the deduplication sets.
   */
  retrieveDeduplicationSets() {
    this.deduplicationStateService.dispatchRetrieveDeduplicationSetsBySignature(
      this.signatureId,
      this.rule,
      null
    );
    this.getAllItems();
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
    this.sets$.subscribe((sets: SetObject[]) => {
      sets.forEach((set) => {
        this.deduplicationStateService.dispatchRetrieveDeduplicationSetItems(
          set.id
        );
        const items$: Observable<SetItemsObject[]> =
          this.deduplicationStateService.getDeduplicationSetItems(set.id);
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
   * Returns the item's authors.
   * @param metadata The metadata of the item
   * @returns {string}
   */
  getAuthor(metadata: MetadataMap): string[] {
    if (metadata) {
      const authorList = metadata['dc.contributor.author'];
      if (hasValue(authorList)) {
        return authorList.map((x) => x.value);
      } else {
        return ['-'];
      }
    }
  }

  /**
   * Returns the item's dates issued.
   * @param metadata The metadata of the item
   * @returns  {string[]}
   */
  getDateIssued(metadata: MetadataMap): string[] {
    if (hasValue(metadata)) {
      const dates = metadata['dc.date.issued'];
      if (hasValue(dates)) {
        return dates.map((x) => x.value);
      } else {
        return ['-'];
      }
    }
  }

  /**
   * Returns the item's titles.
   * @param metadata The metadata of the item
   * @returns {string[]}
   */
  getItemTitle(metadata: MetadataMap): string[] {
    if (hasValue(metadata)) {
      const titles = metadata['dc.title'];
      if (hasValue(titles)) {
        return titles.map((x) => x.value);
      } else {
        return ['-'];
      }
    }
  }

  /**
   * Returns the item's types.
   * @param metadata The metadata of the item
   * @returns  {string[]}
   */
  getType(metadata: MetadataMap): string[] {
    if (metadata) {
      const types = metadata['dc.type'];
      if (hasValue(types)) {
        return types.map((x) => x.value);
      } else {
        return ['-'];
      }
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
          return item?.map((x) => x.id);
        })
      );
    }
  }

  /**
   * Delete the set.
   * @param setId The id of the set to which the items belong to.
   */
  protected deleteSet(setId: string, setChecksum: string) {
    this.deduplicationSetsService
      .deleteSet(this.signatureId, setChecksum)
      .subscribe((res: RemoteData<NoContent>) => {
        if (res.hasSucceeded) {
          this.deduplicationStateService.dispatchDeleteSet(
            this.signatureId,
            setId
          );
        } else {
          this.notificationsService.error(
            null,
            this.translate.get(
              'deduplication.sets.notification.cannot-remove-set'
            )
          );
        }
      });
  }

  /**
   * Delete the item.
   * @param itemId The id of the item to be deleted
   */
  protected removeItem(itemId: string, setChecksum: string, setId: string) {
    this.deduplicationSetsService
      .removeItem(this.signatureId, itemId, setChecksum)
      .subscribe((res: RemoteData<NoContent>) => {
        if (res.hasSucceeded) {
          this.dispatchRemoveItem(itemId, setId);
        } else {
          this.notificationsService.error(
            null,
            this.translate.get(
              'deduplication.sets.notification.cannot-remove-item'
            )
          );
        }
      });
  }

  /**
   * Confirms the deletion of the set | item.
   * @param content The modal content
   * @param elementId itemId | setId (based on situation)
   * @param element 'item' | 'set' (identifier for the element to be deleted)
   */
  public confirmDelete(
    content,
    elementId: string,
    element: 'item' | 'set' | 'no-dupliacation',
    setChecksum: string,
    setId?: string
  ) {
    this.modalService.open(content).result.then((result) => {
      if (isEqual(result, 'ok')) {
        if (isEqual(element, 'set')) {
          this.deleteSet(elementId, setChecksum);
        } else if (isEqual(element, 'no-dupliacation')) {
          this.checkedItemsList.get(setId).forEach((item: SelectedItemData) => {
            if (item.checked) {
              this.removeItem(item.itemId, setChecksum, setId);
            }
          });
        } else if (isEqual(element, 'item')) {
          this.deleteItem(elementId, setId);
        }
      }
    });
  }

  /**
   * Calculates the number of checked items per set.
   * @param {*} event Checkbox event
   * @param {string} itemId The id of the item is checked
   * @param {string} setId The id of the set to which the item belongs to
   */
  onItemCheck(event, itemId: string, setId: string) {
    if (this.checkedItemsList.has(setId)) {
      if (event.target.checked) {
        this.checkedItemsList.get(setId).push({
          itemId: itemId,
          checked: event.target.checked,
        });
      } else if (!event.target.checked) {
        const element = this.checkedItemsList
          .get(setId)
          .findIndex((x) => isEqual(x.itemId, itemId));
        this.checkedItemsList.get(setId).splice(element, 1);
      }
    } else {
      this.checkedItemsList.set(setId, [
        {
          checked: event.target.checked,
          itemId: itemId,
        },
      ]);
    }
  }

  noDuplicatesAction(content, setId: string, setChecksum: string) {
    if (
      !this.checkedItemsList.has(setId) ||
      this.checkedItemsList.get(setId).length < 2
    ) {
      this.notificationsService.warning(
        null,
        this.translate.get('deduplication.sets.notification.select-items')
      );
    } else {
      this.confirmDelete(content, null, 'no-dupliacation', setChecksum, setId);
    }
  }

  getItemOwningCollectionName(item: SetItemsObject): Observable<string> {
    if (hasValue(item._links?.owningCollection.href)) {
      return this.deduplicationSetsService
        .getItemOwningCollection(item._links.owningCollection.href)
        .pipe(
          getRemoteDataPayload(),
          map(
            (collection: Collection) =>
              collection?.metadata['dc.title'][0].value
          )
        );
    } else {
      return of('-');
    }
  }

  protected deleteItem(itemId: string, setId) {
    if (this.itemsMap.has(setId)) {
      this.getItemsPerSet(setId)
        .pipe(
          map((items: SetItemsObject[]) =>
            items?.find((x) => isEqual(x.id, itemId))
          )
        ).subscribe((item: SetItemsObject) => {
          if (item && item.isArchived) {
            console.log('Item is archived');
            this.deduplicationSetsService
              .deleteSetItem(itemId)
              .pipe(getFirstCompletedRemoteData(), take(1))
              .subscribe((res: RemoteData<NoContent>) => {
                if (res.hasSucceeded) {
                  this.dispatchRemoveItem(itemId, setId);
                  // this.retrieveDeduplicationSets();
                } else {
                  this.notificationsService.error(
                    null,
                    this.translate.get(
                      'deduplication.sets.notification.cannot-remove-item'
                    )
                  );
                }
              });
          } else if (item && item.isDiscoverable) {
            //TODO: delete item based on other status
            console.log('Item is Discoverable');
          }
        });
    }
  }

  /**
   * Returns if the logged in user is an Admin.
   * @returns {Observable<boolean>}
   */
  private isCurrentUserAdmin(): Observable<boolean> {
    return this.authorizationService
      .isAuthorized(FeatureID.AdministratorOf, undefined, undefined)
      .pipe(take(1));
  }

  private dispatchRemoveItem(itemId: string, setId: string) {
    this.deduplicationStateService.dispatchRemoveItem(
      this.signatureId,
      itemId,
      setId
    );
  }
}

export interface SelectedItemData {
  checked: boolean;
  itemId: string;
}
