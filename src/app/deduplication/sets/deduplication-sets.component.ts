import { WorkflowItem } from './../../core/submission/models/workflowitem.model';
import { SubmitDataResponseDefinitionObject } from './../../core/shared/submit-data-response-definition.model';
import { Collection } from './../../core/shared/collection.model';
import { FeatureID } from './../../core/data/feature-authorization/feature-id';
import { AuthorizationDataService } from './../../core/data/feature-authorization/authorization-data.service';
import { hasValue } from './../../shared/empty.util';
import { MetadataMap } from './../../core/shared/metadata.models';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { SetItemsObject } from './../../core/deduplication/models/set-items.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, AfterViewInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SetObject } from '../../core/deduplication/models/set.model';
import { DeduplicationStateService } from '../deduplication-state.service';
import { map, take, concatMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeduplicationSetsService } from './deduplication-sets.service';
import { NoContent } from './../../core/shared/NoContent.model';
import { RemoteData } from './../../core/data/remote-data';
import { isEqual, isNull } from 'lodash';
import {
  getFirstCompletedRemoteData,
  getRemoteDataPayload,
} from './../../core/shared/operators';
import { ConfigObject } from './../../core/config/models/config.model';

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
    private router: Router,
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
  protected retrieveDeduplicationSets() {
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
  protected getAllItems() {
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
   * Deletes the set.
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
   * Removes items (case of no deduplicaton).
   * @param itemId The id of the item to be deleted
   */
  protected removeItem(itemId: string, setChecksum: string, setId: string) {
    this.deduplicationSetsService
      .removeItem(this.signatureId, itemId, setChecksum)
      .subscribe((res: RemoteData<NoContent>) => {
        if (res.hasSucceeded || isEqual(res.statusCode, 204)) {
          this.dispatchRemoveItem(itemId, setId);
          this.notificationsService.success(null, 'Item Removed');
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
    this.modalService.open(content).dismissed.subscribe((result) => {
      if (isEqual(result, 'ok')) {
        if (isEqual(element, 'set')) {
          this.deleteSet(elementId, setChecksum);
        } else if (isEqual(element, 'no-dupliacation')) {
          this.checkedItemsList.get(setId).forEach((selectedElement: SelectedItemData) => {
            if (selectedElement.checked) {
              this.removeItem(selectedElement.itemId, setChecksum, setId);
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

  /**
   * Checks if there are at least 2 selected items and performes the deletion of the set.
   * @param content The modal content
   * @param setId The id of the set to which the items belong to.
   * @param setChecksum The checksum of the set.
   */
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

  /**
   * Retrieves the owning collection of the item.
   * @param item The item for which the collection name is to be retrieved
   * @returns {Observable<string> } The name of the collection
   */
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

  /**
   * Deletes an item based on the item status.
   * @param itemId The id of the item to be deleted
   * @param setId The id of the set to which the item belongs to
   */
  protected deleteItem(itemId: string, setId): void {
    if (this.itemsMap.has(setId)) {
      this.getItemsPerSet(setId)
        .pipe(
          map((items: SetItemsObject[]) =>
            items?.find((x) => isEqual(x.id, itemId))
          )
        )
        .subscribe((item: SetItemsObject) => {
          if (item && item.isArchived) {
            // delete item from set if item status is Archived
            this.deduplicationSetsService
              .deleteSetItem(itemId)
              .pipe(getFirstCompletedRemoteData(), take(1))
              .subscribe((res: RemoteData<NoContent>) => {
                if (res.hasSucceeded || isEqual(res.statusCode, 204)) {
                  this.dispatchRemoveItem(itemId, setId);
                  this.notificationsService.success(null, 'Item Removed');
                } else {
                  this.notificationsService.error(
                    null,
                    this.translate.get(
                      'deduplication.sets.notification.cannot-remove-item'
                    )
                  );
                }
              });
            return;
          }

          if (item) {
            // In other case get item submission status
            // If status is workspaceItem or workflowItem
            this.getItemSubmissionStatus(itemId)
              .pipe(take(1))
              .subscribe((x) => {
                const object = x;
                if (!isNull(object)) {
                  if (object instanceof WorkflowItem) {
                    // if WorkflowItem
                    this.deleteWorkflowItem(object.id).subscribe(
                      (res: SubmitDataResponseDefinitionObject) => {
                        this.dispatchRemoveItem(itemId, setId);
                        this.notificationsService.success(null, 'Item Removed');
                      },
                      (err) => {
                        this.notificationsService.error(
                          null,
                          this.translate.get(
                            'deduplication.sets.notification.cannot-remove-item'
                          )
                        );
                      }
                    );
                  } else {
                    // if WorkspaceItem
                    this.deduplicationSetsService.deleteWorkspaceItemById(
                      (object[0] as ConfigObject).id
                    ).subscribe(
                      (res) => {
                        this.dispatchRemoveItem(itemId, setId);
                        this.notificationsService.success(null, 'Item Removed');
                      },
                      (err) => {
                        this.notificationsService.error(
                          null,
                          this.translate.get(
                            'deduplication.sets.notification.cannot-remove-item'
                          )
                        );
                      }
                    );
                  }
                }
              });
            return;
          }
        });
    }
  }

  /**
   * Selects all items in a set.
   */
  selectAllItems(setId: string) {
    if (this.checkedItemsList.has(setId)) {
      this.checkedItemsList.delete(setId);
    }
    const selectedItems: SelectedItemData[] = [];
    this.getItemIds(setId).subscribe((itemIds: string[]) => {
      if (itemIds) {
        itemIds.forEach((itemId) => {
          selectedItems.push({
            itemId: itemId,
            checked: true,
          });
        });
      }
    });
    this.checkedItemsList.set(setId, selectedItems);
  }

  /**
   * Checks if the item is checked or not.
   */
  isItemChecked(itemId: string, setId: string) {
    if (this.checkedItemsList.has(setId)) {
      return this.checkedItemsList
        .get(setId)
        .find((x) => isEqual(x.itemId, itemId))?.checked;
    }
    return false;
  }

  /**
   * Unselects all items in the set.
   */
  unselectAllItems(setId: string) {
    if (this.checkedItemsList.has(setId)) {
      this.checkedItemsList.delete(setId);
    }
  }

  onCompare(setChecksum: string, set_id: string) {
    if (this.checkedItemsList.has(set_id) && this.checkedItemsList.get(set_id).length >= 2) {
      const selectedItemsMap = this.checkedItemsList.get(set_id);
      if (hasValue(selectedItemsMap)) {
        const itemsPerSet: string[] = selectedItemsMap.map(element =>
          element.itemId
        );
        this.deduplicationStateService.dispatchAddItemsToCompare(itemsPerSet);
        // * setId: signature-id:set-checksum *
        const setId = `${this.signatureId}:${setChecksum}`;
        this.router.navigate([`/admin/deduplication/compare`, setId]);
      }
    } else {
      this.notificationsService.info(null, 'Select at least two items');
    }
  }

  /**
   * Request to change the status of the sets' items.
   * @param itemId The id of the item to be removed
   * @param setId The id of the set to which the item belongs to
   */
  private dispatchRemoveItem(itemId: string, setId: string) {
    this.deduplicationStateService.dispatchRemoveItem(
      this.signatureId,
      itemId,
      setId
    );

    // if length of remained items is
    if (this.itemsMap.has(setId)) {
      this.itemsMap.get(setId).subscribe((items: SetItemsObject[]) => {
        if (items && isEqual(items.length, 1)) {
          this.itemsMap.delete(setId);
        }
      });
    }
  }

  /**
   * Get workflow/workspace item if it exists
   * @param itemId The id of the item
   * @returns {Observable<WorkflowItem | null | SubmitDataResponseDefinitionObject>}
   * The WorkflowItem (if it exists) or WorkspaceItem or null if it doesn't exist
   */
  private getItemSubmissionStatus(
    itemId: string
  ): Observable<WorkflowItem | null | SubmitDataResponseDefinitionObject> {
    return this.getWorkflowItemStatus(itemId).pipe(
      concatMap((res: WorkflowItem | null) => {
        if (isNull(res)) {
          return this.getWorkspaceItemStatus(itemId);
        } else {
          return of(res);
        }
      })
    );
  }

  /**
   * Get WorkspaceItem if it exists.
   * @param itemId The id of the item to get the status for
   * @returns {Observable<SubmitDataResponseDefinitionObject>}
   */
  private getWorkspaceItemStatus(
    itemId: string
  ): Observable<SubmitDataResponseDefinitionObject> {
    return this.deduplicationSetsService.getSubmissionWorkspaceitem(itemId);
  }

  /**
   * Get WorkflowItem submission status.
   * If the response status is 200, the item is a WorkflowItem.
   * If the response status is 204, the item is not found as WorkflowItem.
   * @param itemId The id of the item to get the status for
   * @returns {Observable<WorkflowItem | null>} The WorkflowItem or null
   */
  private getWorkflowItemStatus(
    itemId: string
  ): Observable<WorkflowItem | null> {
    return this.deduplicationSetsService
      .getSubmissionWorkflowItems(itemId)
      .pipe(
        map((res) => {
          if (isEqual(res.statusCode, 200)) {
            return res.payload;
          } else {
            return null;
          }
        })
      );
  }

  /**
   * Deletes WorkflowItem. (The item is converted into a WorkspaceItem),
   * Gets the WorkspaceItem and deletes it.
   * @param itemId The id of the item to be deleted
   */
  private deleteWorkflowItem(itemId: string) {
    if (hasValue(itemId)) {
      return this.deduplicationSetsService.deleteWorkflowItem(itemId).pipe(
        concatMap((res: RemoteData<NoContent>) => {
          if (res.hasSucceeded || isEqual(res.statusCode, 204)) {
            return this.getWorkspaceItemStatus(itemId).pipe(
              concatMap((item: SubmitDataResponseDefinitionObject) => {
                if (hasValue(item)) {
                  return this.deduplicationSetsService.deleteWorkspaceItemById((item[0] as ConfigObject).id);
                }
              })
            );
          }
        })
      );
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
}

export interface SelectedItemData {
  checked: boolean;
  itemId: string;
}
