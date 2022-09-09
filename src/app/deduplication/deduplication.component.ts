import { getFirstCompletedRemoteData } from './../core/shared/operators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { Component, OnInit } from '@angular/core';
import { take, switchMap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DeduplicationStateService } from './deduplication-state.service';
import { SignatureObject } from '../core/deduplication/models/signature.model';
import { WorkflowItem } from '../core/submission/models/workflowitem.model';
import { hasValue } from '../shared/empty.util';
import { WorkspaceitemDataService } from '../core/submission/workspaceitem-data.service';
import { WorkflowItemDataService } from '../core/submission/workflowitem-data.service';
import { WorkspaceItem } from '../core/submission/models/workspaceitem.model';
import { isNil, isEqual } from 'lodash';
import { RemoteData } from '../core/data/remote-data';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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

  public itemUuidsToCompare: string = '';

  constructor(
    private deduplicationStateService: DeduplicationStateService,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    private modalService: NgbModal,
    private workspaceitemDataService: WorkspaceitemDataService,
    private workflowItemDataService: WorkflowItemDataService
  ) { }

  /**
   * Component intitialization.
   */
  ngOnInit(): void {
    this.signatures$ =
      this.deduplicationStateService.getDeduplicationSignatures();
    this.totalPages$ =
      this.deduplicationStateService.getDeduplicationSignaturesTotalPages();
  }

  /**
   * First deduplication signatures loading after view initialization.
   */
  ngAfterViewInit(): void {
    this.deduplicationStateService
      .isDeduplicationSignaturesLoaded()
      .pipe(take(1))
      .subscribe(() => {
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
   * Retrieve more deduplication signatures from the server.
   */
  public addMoreDeduplicationSignatures(): void {
    this.deduplicationStateService.dispatchRetrieveDeduplicationSignatures();
  }

  /**
   * Checks if the first entered id is a workflow/workspace item,
   * if it represents a workflow/workspace cannot be selected as a target item
   */
  validateItems(content) {
    const uuidsList: string[] = this.itemUuidsToCompare
      .trim()
      .split(',')
      .filter((el) => el.length > 0);
    if (uuidsList.length > 1) {
      // first we check if the identifier represents a workflow item,
      // then if is not we check if the identifier represents a workspace item.
      // If it does not represents one of them, it might be selected as target item
      this.getWorkflowItemStatus(uuidsList[0].trim())
        .pipe(
          switchMap((item: WorkflowItem) => {
            if (!hasValue(item)) {
              return this.getWorkspaceItemStatus(uuidsList[0].trim());
            } else {
              return of(item);
            }
          })
        )
        .subscribe((res: WorkflowItem | WorkspaceItem) => {
          if (isNil(res)) {
            this.modalService.open(content).closed.subscribe((result) => {
              if (isEqual(result, 'ok')) {
                this.notificationsService.info(
                  null,
                  this.translate.get(
                    'Continue with the merge ...'
                  )
                );
              }
            })
          }
        });
    } else {
      // We should make sure we have set at least 2 identifiers to compare
      this.notificationsService.info(
        null,
        this.translate.get('deduplication.compare.required-condition')
      );
    }
  }

  /**
   * GET workflow item status based on the given uuid
   * @param itemUuid The item's uuid
   * @returns {Observable<WorkflowItem>}
   */
  private getWorkflowItemStatus(itemUuid: string): Observable<WorkflowItem> {
    return this.workflowItemDataService.findById(itemUuid).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<WorkflowItem>) => {
        if (rd.hasSucceeded && rd.payload) {
          this.notificationsService.error(
            this.translate.get('deduplication.compare.notification.change-order.title'),
            this.translate.get('deduplication.compare.notification.id-workflow-item')
          );
          return rd.payload;
        } else if (rd.hasFailed && isEqual(rd.statusCode, 500)) {
          this.notificationsService.error(
            null,
            this.translate.get('deduplication.compare.notification.error')
          );
        }
      })
    );
  }

  /**
   * GET workspace item status based on the given uuid
   * @param itemUuid The item's uuid
   * @returns {Observable<WorkspaceItem>}
   */
  private getWorkspaceItemStatus(itemUuid: string): Observable<WorkspaceItem> {
    return this.workspaceitemDataService.findById(itemUuid).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<WorkspaceItem>) => {
        if (rd.hasSucceeded && rd.payload) {
          this.notificationsService.error(
            this.translate.get('deduplication.compare.notification.change-order.title'),
            this.translate.get('deduplication.compare.notification.id-workspace-item')
          );
          return rd.payload;
        } else if (rd.hasFailed && isEqual(rd.statusCode, 500)) {
          this.notificationsService.error(
            null,
            this.translate.get('deduplication.compare.notification.error')
          );
        }
      })
    );
  }
}
