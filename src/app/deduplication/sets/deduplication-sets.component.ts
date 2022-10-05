import { MergeObject } from './../../core/deduplication/models/merge-object.model';
import { GetBitstreamsPipe } from './../deduplication-merge/pipes/ds-get-bitstreams.pipe';
import { Item } from './../../core/shared/item.model';
import {
  ItemsMetadataField,
  MergeSetItems,
} from './../interfaces/deduplication-merge.models';
import { WorkflowItem } from './../../core/submission/models/workflowitem.model';
import { SubmitDataResponseDefinitionObject } from './../../core/shared/submit-data-response-definition.model';
import { Collection } from './../../core/shared/collection.model';
import { FeatureID } from './../../core/data/feature-authorization/feature-id';
import { AuthorizationDataService } from './../../core/data/feature-authorization/authorization-data.service';
import { hasValue } from './../../shared/empty.util';
import { MetadataMap } from './../../core/shared/metadata.models';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  AfterViewInit,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { SetObject } from '../../core/deduplication/models/set.model';
import { DeduplicationStateService } from '../deduplication-state.service';
import { map, take, concatMap, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeduplicationSetsService } from './deduplication-sets.service';
import { NoContent } from './../../core/shared/NoContent.model';
import { RemoteData } from './../../core/data/remote-data';
import { isEqual, isNull } from 'lodash';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
} from './../../core/shared/operators';
import { ConfigObject } from './../../core/config/models/config.model';
import { CookieService } from '../../core/services/cookie.service';
import { SelectedItemData } from '../interfaces/deduplication-sets.models';
import { DeduplicationItemsService } from '../deduplication-merge/deduplication-items.service';
import { Bitstream } from '../../core/shared/bitstream.model';
import { getEntityPageRoute } from '../../item-page/item-page-routing-paths';

@Component({
  selector: 'ds-deduplication-sets',
  templateUrl: './deduplication-sets.component.html',
  styleUrls: ['./deduplication-sets.component.scss'],
  providers: [GetBitstreamsPipe],
})
export class DeduplicationSetsComponent implements AfterViewInit {
  /**
   * List of compare buttons,
   * in order to focus the one inside a set on select all action.
   * @type {QueryList<any>}
   */
  @ViewChildren('compareBtnSelector') compareBtnSelector: QueryList<any>;

  /**
   * The deduplication signatures' sets list.
   * @type {Observable<SetObject[]>}
   */
  public sets$: Observable<SetObject[]>;

  /**
   * Stores all items per set.
   * @type {Map<string, Observable<Item[]>>}
   */
  public itemsMap: Map<string, Observable<Item[]>> = new Map();

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
  public checkedItemsList: Map<string, SelectedItemData[]> = new Map();

  /**
   * Initial configurations of confirmation modal's title and button text.
   */
  confirmModalText = {
    title: '',
    btnText: '',
    titleClass: '',
    btnClass: '',
  };

  /**
   * Remove element modal's title text.
   */
  removeElementText = 'deduplication.sets.modal.title';

  /**
   * Remove element modal's submit button text.
   */
  delteBtnText = 'deduplication.sets.modal.delete.submit';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deduplicationStateService: DeduplicationStateService,
    private cookieService: CookieService,
    private modalService: NgbModal,
    private deduplicationSetsService: DeduplicationSetsService,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    private authorizationService: AuthorizationDataService,
    private deduplicationItemsService: DeduplicationItemsService,
    private getBitstreamsPipe: GetBitstreamsPipe
  ) {
    this.signatureId = this.route.snapshot.params.id;
    this.rule = this.route.snapshot.params.rule;
  }

  ngOnInit(): void {
    // GET Sets
    this.sets$ = this.deduplicationStateService
      .getDeduplicationSetsPerSignature();
    // .pipe(
    // map((sets: SetObject[]) => {
    //   // TODO: remove filter after rest changes
    //   return sets.filter((set) =>
    //     isEqual(set.signatureId, this.signatureId)
    //   );
    // })
    // );
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
   *  Returns the information about the loading status of the sets (if it's running or not).
   * @returns {Observable<boolean>}
   */
  public isSetsLoading(): Observable<boolean> {
    return this.deduplicationStateService.isDeduplicationSetsLoading();
  }

  /**
   * Retrieves the items per set from the Map
   * @param setId The id of the set to which the items belong to.
   * @returns {Observable<Item[]>}
   */
  getItemsPerSet(setId: string): Observable<Item[]> {
    return this.itemsMap.get(setId) ?? of([]);
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
      }
    }
    return ['-'];
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
      }
    }
    return ['-'];
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
      }
    } return ['-'];
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
      }
    }
    return ['-'];
  }

  /**
   * Returns the item's ids.
   * @param setId The id of the set to which the items belong to.
   * @returns { Observable<string[]>}
   */
  getItemIds(setId: string): Observable<string[]> {
    if (this.itemsMap.has(setId)) {
      return this.itemsMap.get(setId).pipe(
        map((item: Item[]) => {
          return item?.map((x) => x.id);
        })
      );
    }
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
    this.confirmModalText = {
      title: this.removeElementText,
      btnText: this.delteBtnText,
      titleClass: 'text-danger',
      btnClass: 'btn-danger'
    };

    this.modalService.open(content).dismissed.subscribe((result) => {
      if (isEqual(result, 'ok')) {
        if (isEqual(element, 'set')) {
          this.deleteSet(elementId, setChecksum);
        } else if (isEqual(element, 'no-dupliacation')) {
          this.checkedItemsList
            .get(setId)
            .forEach((selectedElement: SelectedItemData) => {
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
  getItemOwningCollectionName(item: Item): Observable<string> {
    if (hasValue(item?._links?.owningCollection.href)) {
      return this.deduplicationSetsService
        .getItemOwningCollection(item._links.owningCollection.href)
        .pipe(
          getFirstSucceededRemoteDataPayload(),
          map(
            (collection: Collection) =>
              collection?.metadata['dc.title'][0].value ?? '-'
          )
        );
    } else {
      return of('-');
    }
  }

  /**
   * Selects all items in a set.
   */
  selectAllItems(setId: string, idx: string) {
    if (this.checkedItemsList.has(setId)) {
      this.checkedItemsList.delete(setId);
    }
    this.compareBtnSelector.toArray()[idx].nativeElement.focus();
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

  /**
   * 1. Checks if there are at least 2 items selected in the set, in order to compare them among them.
   * 2. Set the selected items data in the store, in order to be used in the merge page.
   * 3. Redirects to the merge page by @var setId: signature-id:set-checksum.
   * 4. If there are no items selected, show a warning message.
   * @param setChecksum The checksum of the set.
   * @param setId The id of the set.
   */
  onCompare(setChecksum: string, setId: string) {
    if (
      this.checkedItemsList.has(setId) &&
      this.checkedItemsList.get(setId).length >= 2
    ) {
      const selectedItemsMap = this.checkedItemsList.get(setId);
      if (hasValue(selectedItemsMap)) {
        const itemsPerSet: string[] = selectedItemsMap.map(
          (element) => element.itemId
        );
        this.cookieService.set(
          `items-to-compare-${setChecksum}`,
          JSON.stringify(itemsPerSet)
        );
        this.router.navigate(
          [`/admin/deduplication/compare`, this.signatureId, setChecksum],
          { queryParams: { rule: this.rule } }
        );
      }
    } else {
      this.notificationsService.info(
        null,
        this.translate.get('deduplication.sets.notification.select-items')
      );
    }
  }

  /**
   * Performs the merge action over the selected item
   * @param setId The identifier of the set
   * @param item Item participating on the merge
   * @param content Confirmation modal
   */
  keepItem(setId: string, item: Item, content) {
    this.confirmModalText = {
      title: this.translate.instant('deduplication.sets.modal.confirm.merge', { param: item.uuid }),
      btnText: this.translate.instant('deduplication.sets.modal.merge.submit'),
      titleClass: 'text-info',
      btnClass: 'btn-info'
    };

    this.modalService.open(content).dismissed.subscribe((result) => {
      if (isEqual(result, 'ok')) {
        let bitstreamLinks: string[] = [];
        const metadataValues: ItemsMetadataField[] = [];
        let itemToKeep: MergeSetItems;
        // construct merge object
        item.metadataAsList.forEach((el, index) => {
          metadataValues.push({
            metadataField: el.key,
            sources: [
              {
                place: el.place,
                item: item._links?.self?.href,
              },
            ],
          });
        });
        // GET bitstream for the item
        this.getBitstreamsPipe
          .transform(item)
          .pipe(
            concatMap((res$: Observable<Bitstream[]>) =>
              res$.pipe(map((bitstreams: Bitstream[]) => bitstreams))
            )
          )
          .pipe(
            switchMap((bitstreams: Bitstream[], index: number) => {
              const linksPerItem = bitstreams.map((b) => b._links.self.href);
              bitstreamLinks = linksPerItem;
              itemToKeep = {
                setId: setId,
                bitstreams: bitstreamLinks,
                mergedItems: [],
                metadata: metadataValues,
              };

              return this.deduplicationItemsService.mergeData(
                itemToKeep,
                item.uuid
              );
            })
          )
          .subscribe((res: MergeObject) => {
            if (hasValue(res)) {
              // remove set from store
              this.deduplicationStateService.dispatchDeleteSet(
                this.signatureId,
                setId
              );
            }
          });
      }
    });
  }

  /**
   * Navigates back to deduplication panel
   */
  goBack() {
    this.router.navigate(['admin/deduplication']);
  }

  /**
   * Returns the path to navigate to item's details page.
   * @param item Dspace item
   */
  getItemPage(item: Item): string {
    const type = item.firstMetadataValue('dspace.entity.type');
    return getEntityPageRoute(type, item.uuid);
  }

  //#region Privates
  /**
   * Retrieves the items per set.
   */
  public getAllItems() {
    this.sets$?.subscribe((sets: SetObject[]) => {
      sets.forEach((set) => {
        this.deduplicationStateService.dispatchRetrieveDeduplicationSetItems(
          set.id
        );
        const items$: Observable<Item[]> =
          this.deduplicationStateService.getDeduplicationSetItems(set.id);
        this.itemsMap.set(set.id, items$);
      });
    });
  }

  /**
   * Deletes the set.
   * @param setId The id of the set to which the items belong to.
   */
  private deleteSet(setId: string, setChecksum: string) {
    this.deduplicationSetsService
      .deleteSet(this.signatureId, setChecksum)
      .subscribe((res: RemoteData<NoContent>) => {
        if (res.hasSucceeded) {
          this.notificationsService.success(
            null,
            this.translate.get('Set deleted')
          );
          this.deduplicationStateService.dispatchDeleteSet(
            this.signatureId,
            setId
          );
        }
        // else if (isEqual(res.statusCode, 204)) {
        //   this.notificationsService.error(
        //     null,
        //     this.translate.get('deduplication.sets.notification.cannot-delete-set')
        //   );
        // }
        else {
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
  private removeItem(itemId: string, setChecksum: string, setId: string) {
    this.deduplicationSetsService
      .removeItem(this.signatureId, itemId, setChecksum)
      .subscribe((res: RemoteData<NoContent>) => {
        if (res.hasSucceeded || isEqual(res.statusCode, 204)) {
          this.dispatchRemoveItem(itemId, setId);
          this.notificationsService.success(
            null,
            this.translate.get('deduplication.sets.notification.item-removed')
          );
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
   * Deletes an item based on the item status.
   * @param itemId The id of the item to be deleted
   * @param setId The id of the set to which the item belongs to
   */
  private deleteItem(itemId: string, setId): void {
    if (this.itemsMap.has(setId)) {
      this.getItemsPerSet(setId)
        .pipe(map((items: Item[]) => items?.find((x) => isEqual(x.id, itemId))))
        .subscribe((item: Item) => {
          if (item && item.isArchived) {
            // delete item from set if item status is Archived
            this.deduplicationSetsService
              .deleteSetItem(itemId)
              .pipe(getFirstCompletedRemoteData(), take(1))
              .subscribe((res: RemoteData<NoContent>) => {
                if (res.hasSucceeded || isEqual(res.statusCode, 204)) {
                  this.dispatchRemoveItem(itemId, setId);
                  this.notificationsService.success(
                    null,
                    this.translate.get(
                      'deduplication.sets.notification.item-removed'
                    )
                  );
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
            this.deduplicationSetsService.getItemSubmissionStatus(itemId)
              .pipe(take(1))
              .subscribe((x) => {
                const object = x;
                if (!isNull(object)) {
                  if (object instanceof WorkflowItem) {
                    //  WorkflowItem
                    this.deleteWorkflowItem(object.id).subscribe(
                      (res: SubmitDataResponseDefinitionObject) => {
                        this.dispatchRemoveItem(itemId, setId);
                        this.notificationsService.success(
                          null,
                          this.translate.get(
                            'deduplication.sets.notification.item-removed'
                          )
                        );
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
                    //  WorkspaceItem
                    this.deduplicationSetsService
                      .deleteWorkspaceItemById((object[0] as ConfigObject).id)
                      .subscribe(
                        (res) => {
                          this.dispatchRemoveItem(itemId, setId);
                          this.notificationsService.success(
                            null,
                            this.translate.get(
                              'deduplication.sets.notification.item-removed'
                            )
                          );
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
                } else {
                  this.notificationsService.warning(
                    null,
                    this.translate.get('deduplication.sets.notification.cannot-delete-item')
                  );
                }
              });
            return;
          }
        });
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
    if (this.itemsMap.has(setId)) {
      this.itemsMap.get(setId).subscribe((items: Item[]) => {
        if (items && isEqual(items.length, 1)) {
          this.itemsMap.delete(setId);
        }
      });
    }
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
            return this.deduplicationSetsService.getWorkspaceItemStatus(itemId).pipe(
              concatMap((item: SubmitDataResponseDefinitionObject) => {
                if (hasValue(item)) {
                  return this.deduplicationSetsService.deleteWorkspaceItemById(
                    (item[0] as ConfigObject).id
                  );
                }
              })
            );
          }
        })
      );
    }
  }

  /**
   * Retrieves the deduplication sets.
   */
  public retrieveDeduplicationSets() {
    this.deduplicationStateService.dispatchRetrieveDeduplicationSetsBySignature(
      this.signatureId,
      this.rule,
      null
    );
    this.getAllItems();
  }

  /**
   * Returns if the logged in user is an Admin.
   * @returns {Observable<boolean>}
   */
  isCurrentUserAdmin(): Observable<boolean> {
    return this.authorizationService
      .isAuthorized(FeatureID.AdministratorOf, undefined, undefined)
      .pipe(take(1));
  }
  //#endregion
}
