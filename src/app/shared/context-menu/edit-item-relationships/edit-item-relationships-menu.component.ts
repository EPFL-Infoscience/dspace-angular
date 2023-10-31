import {Component, Inject, OnDestroy, OnInit} from '@angular/core';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {map, startWith,} from 'rxjs/operators';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {hasValue, isNotEmpty} from '../../empty.util';
import {EditItemMode} from '../../../core/submission/models/edititem-mode.model';
import {
  getAllSucceededRemoteDataPayload,
  getFirstSucceededRemoteListPayload,
  getPaginatedListPayload
} from '../../../core/shared/operators';
import {EditItemDataService} from '../../../core/submission/edititem-data.service';
import {rendersContextMenuEntriesForType} from '../context-menu.decorator';
import {DSpaceObjectType} from '../../../core/shared/dspace-object-type.model';
import {ContextMenuEntryComponent} from '../context-menu-entry.component';
import {DSpaceObject} from '../../../core/shared/dspace-object.model';
import {TabDataService} from '../../../core/layout/tab-data.service';
import {CrisLayoutCell, CrisLayoutRow, CrisLayoutTab} from '../../../core/layout/models/tab.model';
import {NotificationsService} from '../../notifications/notifications.service';
import {ContextMenuEntryType} from '../context-menu-entry-type';
import {FeatureID} from '../../../core/data/feature-authorization/feature-id';
import {AuthorizationDataService} from '../../../core/data/feature-authorization/authorization-data.service';

/**
 * This component renders a context menu option that provides the links to edit item page.
 */
@Component({
  selector: 'ds-context-menu-edit-item-relationships',
  templateUrl: './edit-item-relationships-menu.component.html'
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class EditItemRelationshipsMenuComponent extends ContextMenuEntryComponent implements OnInit, OnDestroy {

  /**
   * A boolean representing if a request operation is pending
   * @type {BehaviorSubject<boolean>}
   */
  public processing$ = new BehaviorSubject<boolean>(false);

  /**
   * Reference to NgbModal
   */
  public modalRef: NgbModalRef;
  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];
  relationshipTypes = [];
  public relationships = [];
  /**
   * List of Edit Modes available on this item
   * for the current user
   */
  private editModes$: BehaviorSubject<EditItemMode[]> = new BehaviorSubject<EditItemMode[]>([]);
  private isAuthorized$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * Tabs
   */
  private tabs: CrisLayoutTab[];

  canShow$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Initialize instance variables
   *
   * @param {DSpaceObject} injectedContextMenuObject
   * @param {DSpaceObjectType} injectedContextMenuObjectType
   * @param {EditItemDataService} editItemService
   * @param {TabDataService} tabService
   * @param notificationService
   */
  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    private editItemService: EditItemDataService,
    protected tabService: TabDataService,
    protected authorizationService: AuthorizationDataService,
    private notificationService: NotificationsService
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType, ContextMenuEntryType.EditRelationships);
  }

  /**
   * Get edit modes from context id
   * Get tabs from the context id and get boxes of tabs
   */
  ngOnInit(): void {
    this.notificationService.claimedProfile.subscribe(() => {
      this.relationships = [];
      this.initialize();
    });
  }

  /**
   * Get boxes from tabs
   */
  initBoxes(): void {
    this.tabs.forEach((tab: CrisLayoutTab) => {
      tab.rows.forEach((row: CrisLayoutRow) => {
        row.cells.forEach((cell: CrisLayoutCell) => {
          const relationshipsBoxes = cell.boxes.filter((box) => box.boxType === 'RELATION');
          this.relationships.push(...relationshipsBoxes);
        });
      });
    });
  }

  /**
   * Check if edit mode is available
   */
  getEditModes(): Observable<EditItemMode[]> {
    return this.editModes$;
  }

  /**
   * Check if edit mode is available
   */
  isEditAvailable(): Observable<boolean> {
    return this.editModes$.asObservable().pipe(
      map((editModes) => isNotEmpty(editModes) && editModes.length > 0)
    );
  }

  isAuthorized() {
    return this.isAuthorized$.asObservable();
  }

  /**
   * Make sure the subscription is unsubscribed from when this component is destroyed
   */
  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }

  initialize(): void {
    // Retrieve edit modes
    this.subs.push(
      this.editItemService.searchEditModesById(this.contextMenuObject.id).pipe(
        getAllSucceededRemoteDataPayload(),
        getPaginatedListPayload(),
        startWith([])
      ).subscribe((editModes: EditItemMode[]) => {
        this.editModes$.next(editModes);
      }));


    // Retrieve tabs by UUID of item
    this.subs.push(this.tabService.findByItem(this.contextMenuObject.id, false).pipe(
      getFirstSucceededRemoteListPayload()
    ).subscribe((tabs) => {
      this.tabs = tabs;
      this.initBoxes();
    }));

    this.subs.push(
      this.authorizationService.isAuthorized(FeatureID.CanManageRelationships, this.contextMenuObject.self)
        .subscribe((authorized: boolean) => this.isAuthorized$.next(authorized))
    );
  }


}
