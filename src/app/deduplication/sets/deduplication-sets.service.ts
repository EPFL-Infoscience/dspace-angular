import { RequestParam } from '../../core/cache/models/request-param.model';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { WorkflowItem } from '../../core/submission/models/workflowitem.model';
import { SubmitDataResponseDefinitionObject } from '../../core/shared/submit-data-response-definition.model';
import { SubmissionRestService } from '../../core/submission/submission-rest.service';
import { ItemDataService } from '../../core/data/item-data.service';
import { NoContent } from '../../core/shared/NoContent.model';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { FindListOptions } from '../../core/data/find-list-options.model';
import { SetObject } from '../../core/deduplication/models/set.model';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { catchError, concatMap, map, take } from 'rxjs/operators';
import { DeduplicationSetsRestService } from '../../core/deduplication/services/deduplication-sets-rest.service';
import { WorkflowItemDataService } from '../../core/submission/workflowitem-data.service';
import { hasValue } from '../../shared/empty.util';
import isEqual from 'lodash/isEqual';
import isNull from 'lodash/isNull';

@Injectable()
export class DeduplicationSetsService {
  constructor(
    private deduplicationRestService: DeduplicationSetsRestService,
    private itemDataService: ItemDataService,
    private submissionRestService: SubmissionRestService,
    private workflowItemDataService: WorkflowItemDataService,
  ) { }

  /**
   * Returns the sets with the given signature id
   *
   * @param {number} elementsPerPage - the number of elements per page
   * @param {number} currentPage - the current page
   * @param {string} signatureId - the signature id
   * @param {string} [rule] - the rule of the submitter
   * @return {*}  {Observable<PaginatedList<SetObject>>}
   */
  public getSets(
    elementsPerPage: number,
    currentPage: number,
    signatureId: string,
    rule?: string
  ): Observable<PaginatedList<SetObject>> {
    const setListOptions: FindListOptions = new FindListOptions();
    setListOptions.elementsPerPage = elementsPerPage;
    setListOptions.currentPage = currentPage;
    setListOptions.searchParams = [
      new RequestParam('signature-id', signatureId),
      new RequestParam('haveItems', true)
    ];

    if (hasValue(rule)) {
      setListOptions.searchParams.push(new RequestParam('rule', rule));
    }

    return this.deduplicationRestService
      .getSetsPerSignature(setListOptions, followLink('items', {}, followLink('bundles', {}, followLink('bitstreams')), followLink('owningCollection')))
      .pipe(
        getFirstCompletedRemoteData(),
        map((rd: RemoteData<PaginatedList<SetObject>>) => {
          if (rd.hasSucceeded) {
            return rd.payload;
          } else {
            throw new Error(
              "Can't retrieve sets per signature from REST service"
            );
          }
        })
      );
  }

  /**
   * Deletes the set with the given id
   * @param signatureId - the signature id of the set
   * @param checksum
   */
  public deleteSet(
    signatureId: string,
    checksum: string
  ): Observable<RemoteData<NoContent>> {
    return this.deduplicationRestService.deleteSet(signatureId, checksum).pipe(
      catchError((error) => {
        throw new Error("Can't remove the set from REST service");
      })
    );
  }

  /**
   * Deletes the item with the given id
   * @param signatureId - the signature id of the set
   * @param itemId - the item id of the element to be removed
   */
  public removeItem(
    signatureId: string,
    itemId: string,
    seChecksum: string
  ) {
    return this.deduplicationRestService
      .removeItem(signatureId, itemId, seChecksum)
      .pipe(
        catchError((error) => {
          throw new Error("Can't remove the set from REST service");
        })
      );
  }

  /**
   * Deletes the item of a set with the given item id
   * @param itemId The id of the set's item to be deleted
   * @returns {Observable<RemoteData<NoContent>>}
   */
  public deleteSetItem(itemId: string): Observable<RemoteData<NoContent>> {
    return this.itemDataService.delete(itemId);
  }

  /**
   * Get the WorkspaceItem if it exists or not found otherwise
   * @param itemId The id of the item
   */
  public getSubmissionWorkspaceitem(
    itemId: string
  ): Observable<SubmitDataResponseDefinitionObject> {
    return this.submissionRestService.getDataById(
      'workspaceitems',
      `search/item?uuid=${itemId}`
    );
  }

  /**
   * Delete the workspaceitem for the given itemId
   * @param itemId The id of the item
   */
  public deleteWorkspaceItemById(
    itemId: string
  ): Observable<SubmitDataResponseDefinitionObject> {
    return this.submissionRestService.deleteById(itemId).pipe(take(1));
  }

  /**
   * Get the WorkflowItem if it exists or not found otherwise
   * @param itemId The id of the item
   */
  private getSubmissionWorkflowItems(
    itemId: string
  ): Observable<RemoteData<WorkflowItem>> {
    return this.workflowItemDataService.findByItem(itemId);
  }

  /**
   * Delete the workflowitem for the given itemId
   * @param itemId The id of the item
   */
  public deleteWorkflowItem(itemId: string): Observable<RemoteData<NoContent>> {
    return this.workflowItemDataService
      .delete(itemId)
      .pipe(getFirstCompletedRemoteData());
  }

  /**
   * Get workflow/workspace item if it exists
   * @param itemId The id of the item
   * @returns {Observable<WorkflowItem | null | SubmitDataResponseDefinitionObject>}
   * The WorkflowItem (if it exists) or WorkspaceItem or null if it doesn't exist
   */
  public getItemSubmissionStatus(
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
   * Get WorkflowItem submission status.
   * If the response status is 200, the item is a WorkflowItem.
   * If the response status is 204, the item is not found as WorkflowItem.
   * @param itemId The id of the item to get the status for
   * @returns {Observable<WorkflowItem | null>} The WorkflowItem or null
   */
  public getWorkflowItemStatus(
    itemId: string
  ): Observable<WorkflowItem | null> {
    return this.getSubmissionWorkflowItems(itemId).pipe(
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
   * Get WorkspaceItem if it exists.
   * @param itemId The id of the item to get the status for
   * @returns {Observable<SubmitDataResponseDefinitionObject>}
   */
  public getWorkspaceItemStatus(
    itemId: string
  ): Observable<SubmitDataResponseDefinitionObject> {
    return this.getSubmissionWorkspaceitem(itemId);
  }
}
