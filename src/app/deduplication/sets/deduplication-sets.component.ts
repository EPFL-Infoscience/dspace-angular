import { GetItemStatusListPipe } from './pipes/get-item-status-list.pipe';
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
import { MetadataMap, MetadataValue } from './../../core/shared/metadata.models';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { SetObject } from '../../core/deduplication/models/set.model';
import { DeduplicationStateService } from '../deduplication-state.service';
import { map, take, concatMap, switchMap } from 'rxjs/operators';
import { NgbAccordion, NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { DeduplicationSetsService } from './deduplication-sets.service';
import { NoContent } from './../../core/shared/NoContent.model';
import { RemoteData } from './../../core/data/remote-data';
import { isEqual, isNull } from 'lodash';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteDataPayload } from './../../core/shared/operators';
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
  providers: [GetBitstreamsPipe, GetItemStatusListPipe],
})
export class DeduplicationSetsComponent implements AfterViewInit {
  /**
   * List of compare buttons,
   * in order to focus the one inside a set on select all action.
   * @type {QueryList<any>}
   */
  @ViewChildren('compareBtnSelector') compareBtnSelector: QueryList<any>;

  /**
   * Accordions references in order to collapse/expand them on click
   * @type {QueryList<NgbAccordion>}
   */
  @ViewChildren(NgbAccordion) accordions: QueryList<NgbAccordion>;

  /**
   * The deduplication signatures' sets list.
   * @type {Observable<SetObject[]>}
   */
  public sets$: Observable<SetObject[]>;

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
  protected elementsPerPage = 6;

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
   * Remaining number of elements to retrieve
   */
  public totalRemainingElements = 0;
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

  /**
   * List of opened accordion's indexes
   * @type {string[]}
   */
  openedAccordions: string[] = ['panel-0'];

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
    private getBitstreamsPipe: GetBitstreamsPipe,
    private chd: ChangeDetectorRef
  ) {
    this.signatureId = this.route.snapshot.params.id;
    this.rule = this.route.snapshot.params.rule;
  }

  ngOnInit(): void {
    this.sets$ =
      this.deduplicationStateService.getDeduplicationSetsPerSignature();
    this.setsTotalPages$ =
      this.deduplicationStateService.getDeduplicationSetsTotalPages();
    this.setCurrentPage$ =
      this.deduplicationStateService.getDeduplicationSetsCurrentPage();
    this.totalElements$ =
      this.deduplicationStateService.getDeduplicationSetsTotals();
    this.isAdmin$ = this.isCurrentUserAdmin();
    this.chd.detectChanges();
  }

  /**
   * First deduplication sets loading after view initialization.
   */
  ngAfterViewInit(): void {
    // this.chd.detectChanges();
    this.deduplicationStateService
      .isDeduplicationSetsLoaded()
      .pipe(take(1))
      .subscribe(() => {
        this.retrieveDeduplicationSets(false);
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
   * Returns the first metadata value for the given metadata key.
   * @param items The list of the items
   * @param key The key to get its value
   * @returns {string}
   */
  getFirstMetadtaValue(items: Item[], key: string): string {
    if (items.length > 0) {
      const item = items[0];
      if (hasValue(item) && hasValue(item.metadata)) {
        const date = item.firstMetadataValue(key);
        if (hasValue(date)) {
          return date;
        }
      }
    }
    return '-';
  }

  /**
   * Returns the metadata values for the given metadata key.
   * @param metadata The metadata of the item
   * @param key The key to get its value
   * @returns {string[]}
   */
  getMetadataList(metadata: MetadataMap, key: string): string[] {
    if (hasValue(metadata)) {
      const elements: MetadataValue[] = metadata[key];
      if (hasValue(elements)) {
        return elements.map((x) => x.value);
      }
    }
    return ['-'];
  }

  /**
   * Returns the item's ids.
   * @param setId The id of the set to which the items belong to.
   * @returns { Observable<string[]>}
   */
  getItemIds(set: SetObject): string[] {
    return set.itemsList?.map((x) => x.id);
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
    set?: SetObject
  ) {
    this.confirmModalText = {
      title: this.removeElementText,
      btnText: this.delteBtnText,
      titleClass: 'text-danger',
      btnClass: 'btn-danger',
    };

    this.modalService.open(content).dismissed.subscribe((result) => {
      if (isEqual(result, 'ok')) {
        if (isEqual(element, 'set')) {
          this.deleteSet(elementId, setChecksum);
        } else if (isEqual(element, 'no-dupliacation')) {
          this.checkedItemsList
            .get(set.id)
            .forEach((selectedElement: SelectedItemData) => {
              if (selectedElement.checked) {
                this.removeItem(selectedElement.itemId, setChecksum, set);
              }
            });
        } else if (isEqual(element, 'item')) {
          this.deleteItem(elementId, set);
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
  noDuplicatesAction(content, set: SetObject, setChecksum: string) {
    if (
      !this.checkedItemsList.has(set.id) ||
      this.checkedItemsList.get(set.id).length < 2
    ) {

      this.notificationsService.warning(
        null,
        this.translate.get('deduplication.sets.notification.select-items')
      );
    } else {
      this.confirmDelete(content, null, 'no-dupliacation', setChecksum, set);
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
  selectAllItems(set: SetObject, idx: number) {
    if (this.checkedItemsList.has(set.id)) {
      this.checkedItemsList.delete(set.id);
    }
    this.compareBtnSelector?.toArray()[idx]?.nativeElement.focus();
    const selectedItems: SelectedItemData[] = [];
    const itemIds = this.getItemIds(set);
    if (itemIds && itemIds.length > 0) {
      itemIds.forEach((itemId) => {
        selectedItems.push({
          itemId: itemId,
          checked: true,
        });
      });
    }
    this.checkedItemsList.set(set.id, selectedItems);
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
      title: this.translate.instant('deduplication.sets.modal.confirm.merge', {
        param: item.handle,
      }),
      btnText: this.translate.instant('deduplication.sets.modal.merge.submit'),
      titleClass: 'text-info',
      btnClass: 'btn-info',
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
                mergedItems: [], // self-link of the target item should not be sent
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
                setId,
                this.rule
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

  changeFragment(groupIdentifier, panelToCloseIdx) {
    this.accordions
      .toArray()
    [panelToCloseIdx]?.collapse('panel-' + panelToCloseIdx);

    this.router.navigate(
      ['/admin/deduplication/set', this.signatureId, this.rule],
      { fragment: groupIdentifier }
    );

    // when the sets represent duplications based on identifiers (based on another set id)
    // scroll to that set and expand the accordion
    const row = document.getElementById(groupIdentifier);
    if (hasValue(row)) {
      const panelId = Array.from(row.classList).find((x) =>
        x.includes('panel')
      );
      if (hasValue(panelId)) {
        const idx = panelId.slice(-1)[0];
        this.accordions.toArray()[idx].expand(panelId);
      }
    }
  }

  /**
   * Returns the path to navigate to item's details page.
   * @param item Dspace item
   */
  getItemPage(item: Item): string {
    const type = item.firstMetadataValue('dspace.entity.type');
    return getEntityPageRoute(type, item.uuid);
  }

  /**
   * Enables/Disables 'Show More' button,
   * weather there are any left sets to get and show
   * @returns {Observable<boolean>}
   */
  public showMoreButton(): Observable<boolean> {
    return combineLatest([this.totalElements$, this.sets$]).pipe(
      map(([totalElements, sets]) => {
        if (this.elementsPerPage > totalElements) {
          this.totalRemainingElements = 0;
        } else {
          const remainingElements = totalElements - sets.length;
          this.totalRemainingElements = remainingElements > 0 ? remainingElements : 0;
        }
        return this.totalRemainingElements > 0;
      })
    );
  }

  /**
   * Keep opened accordions in case of working with them (ex. deleting only one item)
   * @param event - event of changing panel state(open/ close)
   */
  onPanelChange(event: NgbPanelChangeEvent) {
    const acticeIndex = this.openedAccordions.findIndex(x => isEqual(x, event.panelId));
    if (event.nextState && acticeIndex < 0) {
      this.openedAccordions.push(event.panelId);
    } else if (!event.nextState && acticeIndex > -1) {
      this.openedAccordions.splice(acticeIndex, 1);
    }
  }

  //#region Privates
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
            this.translate.get('deduplication.sets.button.set-deleted')
          );
          this.deduplicationStateService.dispatchDeleteSet(
            this.signatureId,
            setId,
            this.rule
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
  private removeItem(itemId: string, setChecksum: string, set: SetObject) {
    this.deduplicationSetsService
      .removeItem(this.signatureId, itemId, setChecksum)
      .subscribe((res: RemoteData<NoContent>) => {
        if (res.hasSucceeded || isEqual(res.statusCode, 204)) {
          this.dispatchRemoveItem(itemId, set, 'no-duplicate');
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
  private deleteItem(itemId: string, set: SetObject): void {
    const item = set.itemsList.find((x) => isEqual(x.id, itemId));
    if (hasValue(item)) {
      if (item && item.isArchived) {
        // delete item from set if item status is Archived
        this.deduplicationSetsService
          .deleteSetItem(itemId)
          .pipe(
            getFirstCompletedRemoteData(),
            take(1)
          ).subscribe((res: RemoteData<NoContent>) => {
            if (res.hasSucceeded || isEqual(res.statusCode, 204)) {
              this.dispatchRemoveItem(itemId, set, 'delete');
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
        this.deduplicationSetsService
          .getItemSubmissionStatus(itemId)
          .pipe(take(1))
          .subscribe((x) => {
            const object = x;
            if (!isNull(object)) {
              if (object instanceof WorkflowItem) {
                //  WorkflowItem
                this.deleteWorkflowItem(object.id).subscribe(
                  (res: SubmitDataResponseDefinitionObject) => {
                    this.dispatchRemoveItem(itemId, set, 'delete');
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
                      this.dispatchRemoveItem(itemId, set, 'delete');
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
                this.translate.get(
                  'deduplication.sets.notification.cannot-delete-item'
                )
              );
            }
          });
        return;
      }
    }
  }

  /**
   * Request to change the status of the sets' items.
   * @param itemId The id of the item to be removed
   * @param selectedSet The set to which the item belongs to
   */
  dispatchRemoveItem(itemId: string, selectedSet: SetObject, deleteMode: 'delete' | 'no-duplicate') {
    this.deduplicationStateService.dispatchRemoveItemPerSets(
      this.signatureId,
      selectedSet.id,
      this.rule,
      itemId,
      deleteMode
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
            return this.deduplicationSetsService
              .getWorkspaceItemStatus(itemId)
              .pipe(
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
  public retrieveDeduplicationSets(skipToNextPage: boolean) {
    this.deduplicationStateService.dispatchRetrieveDeduplicationSetsBySignature(
      this.signatureId,
      this.rule,
      this.elementsPerPage,
      skipToNextPage
    );
    this.chd.detectChanges();
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
