import { WorkflowItem } from './../../core/submission/models/workflowitem.model';
import { WorkspaceItem } from './../../core/submission/models/workspaceitem.model';
import { RemoteData } from './../../core/data/remote-data';
import { Item } from './../../core/shared/item.model';
import { ItemDataService } from './../../core/data/item-data.service';
import { WorkspaceitemDataService } from './../../core/submission/workspaceitem-data.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { Component, ChangeDetectorRef } from '@angular/core';
import { isEqual } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowItemDataService } from '../../core/submission/workflowitem-data.service';
import { combineLatest, Observable, of } from 'rxjs';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { map, switchMap } from 'rxjs/operators';
import { hasValue } from 'src/app/shared/empty.util';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CookieService } from 'src/app/core/services/cookie.service';

@Component({
  selector: 'ds-compare-item-identifiers',
  templateUrl: './compare-item-identifiers.component.html',
  styleUrls: ['./compare-item-identifiers.component.scss'],
})
export class CompareItemIdentifiersComponent {
  public itemUuidsToCompare: string = '';

  errorMessageList: Map<string, ItemErrorMessages[]> = new Map();

  identifiersLinkList: string[] = [];

  constructor(
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    private workspaceitemDataService: WorkspaceitemDataService,
    private workflowItemDataService: WorkflowItemDataService,
    private itemDataService: ItemDataService,
    private modalService: NgbModal,
    private router: Router,
    private cookieService: CookieService,
    private chd: ChangeDetectorRef
  ) { }

  getItem(itemUuid: string): Observable<Item> {
    return this.itemDataService.findById(itemUuid).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<Item>) => {
        if (rd.hasSucceeded && hasValue(rd.payload)) {
          if (
            !this.identifiersLinkList.some((x) =>
              isEqual(x, rd.payload._links.self.href)
            )
          ) {
            this.identifiersLinkList.push(rd.payload._links.self.href);
          }
          return rd.payload;
        }

        if (rd.hasFailed && isEqual(rd.statusCode, 404)) {
          this.errorMessageList.get(itemUuid).push({
            message: 'deduplication.compare.notification.item-does-not-exists',
            status: 404,
          });
          return null;
        } else {
          this.errorMessageList.get(itemUuid).push({
            message: 'deduplication.compare.notification.error',
            status: 500,
          });
          return null;
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
        if (rd.hasSucceeded && hasValue(rd.payload)) {
          if (
            !this.identifiersLinkList.some((x) =>
              isEqual(x, rd.payload._links.item.href)
            )
          ) {
            this.identifiersLinkList.push(rd.payload._links.item.href);
          }
          return rd.payload;
        } else if (rd.hasFailed && isEqual(rd.statusCode, 404)) {
          this.errorMessageList.get(itemUuid).push({
            message: 'deduplication.compare.workspace-404',
            status: 404,
          });

          return null;
        } else {
          this.errorMessageList.get(itemUuid).push({
            message: 'deduplication.compare.notification.error',
            status: 500,
          });
          return null;
        }
      })
    );
  }

  /**
   * Checks if the first entered id is a workflow/workspace item,
   * if it represents a workflow/workspace cannot be selected as a target item
   */
  validateItems(content) {
    this.errorMessageList = new Map();
    this.identifiersLinkList = [];
    const uuidsList: string[] = this.itemUuidsToCompare
      .trim()
      .split(',')
      .map((id) => id.trim())
      .filter(
        (value, index, categoryArray) => categoryArray.indexOf(value) === index
      )
      .filter((el) => el.length > 0);
    if (uuidsList.length > 1) {
      // first we check if the identifier represents a workflow item,
      // then if is not we check if the identifier represents a workspace item.
      // If it does not represents one of them, it might be selected as target item
      let calls = [];
      uuidsList.forEach((element: string, index: number) => {
        const call = this.checkIdValidity(element, index);
        calls.push(call);
      });

      combineLatest(calls).subscribe((el) => {
        this.chd.detectChanges();
        let counter = 0;
        this.errorMessageList.forEach((value: ItemErrorMessages[]) => {
          if (value.some((x) => isEqual(x.status, 200))) {
            counter++;
          }
        });

        if (isEqual(counter, uuidsList.length)) {
          this.modalService.open(content).closed.subscribe((result) => {
            if (isEqual(result, 'ok')) {
              this.cookieService.set(
                `items-to-compare-identifiersLinkList`,
                JSON.stringify(this.identifiersLinkList)
              );

              this.router.navigate(['admin/deduplication/compare']);
            }
          });
        } else {
          this.notificationsService.warning(
            null,
            this.translate.get('Enter valid identifiers')
          );
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

  checkIdValidity(itemUuid: string, index: number) {
    if (!this.errorMessageList.has(itemUuid)) {
      this.errorMessageList.set(itemUuid, []);
    }
    // GET WORKFLOW ITEM STATUS
    return this.getWorkflowItemStatus(itemUuid).pipe(
      map((workflowItem: WorkflowItem) => {
        if (hasValue(workflowItem)) {
          if (isEqual(index, 0)) {
            this.errorMessageList.delete(itemUuid);
            this.errorMessageList.set(itemUuid, [
              {
                message: 'deduplication.compare.notification.id-workflow-item',
                status: 0,
              },
            ]);

            return null;
          } else {
            this.errorMessageList.delete(itemUuid);
            this.errorMessageList.set(itemUuid, [
              {
                message: 'deduplication.compare.notification.valid-id',
                status: 200,
              },
            ]);

            return workflowItem;
          }
        }
      }),
      switchMap((workflowItem: WorkflowItem) => {
        if (hasValue(workflowItem)) {
          return of(workflowItem);
        } else {
          // GET ITEM STATUS
          return this.getItem(itemUuid).pipe(
            map((item: Item) => {
              if (hasValue(item)) {
                this.errorMessageList.delete(itemUuid);
                this.errorMessageList.set(itemUuid, [
                  {
                    message: 'deduplication.compare.notification.valid-id',
                    status: 200,
                  },
                ]);
                return item;
              } else {
                return null;
              }
            }),
            switchMap((item: Item) => {
              if (hasValue(item)) {
                return of(item);
              } else {
                // GET WORKSPACE ITEM STATUS
                return this.getWorkspaceItemStatus(itemUuid).pipe(
                  map((workspaceItem: WorkspaceItem) => {
                    if (hasValue(workspaceItem)) {
                      if (isEqual(index, 0)) {
                        this.errorMessageList.delete(itemUuid);
                        this.errorMessageList.set(itemUuid, [
                          {
                            message:
                              'deduplication.compare.notification.id-workspace-item',
                            status: 0,
                          },
                        ]);

                        return null;
                      } else {
                        this.errorMessageList.delete(itemUuid);
                        this.errorMessageList.set(itemUuid, [
                          {
                            message:
                              'deduplication.compare.notification.valid-id',
                            status: 200,
                          },
                        ]);
                        return workspaceItem;
                      }
                    }
                  })
                );
              }
            })
          );
        }
      })
    );
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
        if (rd.hasSucceeded && hasValue(rd.payload)) {
          if (
            !this.identifiersLinkList.some((x) =>
              isEqual(x, rd.payload._links.item.href)
            )
          ) {
            this.identifiersLinkList.push(rd.payload._links.item.href);
          }
          return rd.payload;
        } else if (rd.hasFailed && isEqual(rd.statusCode, 404)) {
          this.errorMessageList.get(itemUuid).push({
            message: 'deduplication.compare.workflow-404',
            status: 404,
          });
        } else {
          this.errorMessageList.get(itemUuid).push({
            message: 'deduplication.compare.notification.error',
            status: 500,
          });

          return null;
        }
      })
    );
  }
}

export interface ItemErrorMessages {
  message: string;
  status: number;
}
