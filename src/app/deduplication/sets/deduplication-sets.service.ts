import { RequestParam } from './../../core/cache/models/request-param.model';
import { followLink } from './../../shared/utils/follow-link-config.model';
import { WorkflowItem } from './../../core/submission/models/workflowitem.model';
import { SubmitDataResponseDefinitionObject } from './../../core/shared/submit-data-response-definition.model';
import { SubmissionRestService } from './../../core/submission/submission-rest.service';
import { CollectionDataService } from './../../core/data/collection-data.service';
import { Collection } from './../../core/shared/collection.model';
import { ItemDataService } from './../../core/data/item-data.service';
import { NoContent } from './../../core/shared/NoContent.model';
import { DeduplicationSetItemsRestService } from '../../core/deduplication/services/deduplication-set-items-rest.service';
import { RemoteData } from './../../core/data/remote-data';
import { PaginatedList } from './../../core/data/paginated-list.model';
import { FindListOptions } from './../../core/data/request.models';
import { SetObject } from './../../core/deduplication/models/set.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getFirstCompletedRemoteData } from './../../core/shared/operators';
import { catchError, map, take } from 'rxjs/operators';
import { DeduplicationSetsRestService } from '../../core/deduplication/services/deduplication-sets-rest.service';
import { WorkflowItemDataService } from './../../core/submission/workflowitem-data.service';
import { hasValue } from 'src/app/shared/empty.util';
import { Item } from '../../core/shared/item.model';

@Injectable()
export class DeduplicationSetsService {
  constructor(
    private deduplicationRestService: DeduplicationSetsRestService,
    private deduplicationSetItemsRestService: DeduplicationSetItemsRestService,
    private itemDataService: ItemDataService,
    private collectionDataService: CollectionDataService,
    private submissionRestService: SubmissionRestService,
    private workflowItemDataService: WorkflowItemDataService
  ) {}

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
    const findListOptions: FindListOptions = new FindListOptions();
    findListOptions.elementsPerPage = elementsPerPage;
    findListOptions.currentPage = currentPage;
    findListOptions.searchParams = [
      new RequestParam('signature-id', signatureId),
      new RequestParam('haveItems', true),
    ];

    if (hasValue(rule)) {
      findListOptions.searchParams.push(new RequestParam('rule', rule));
    }

    return this.deduplicationRestService
      .getSetsPerSignature(findListOptions)
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
   * Returns the set items with the given set id
   * @param {string} setId - the set id
   * @return {*}  {Observable<PaginatedList<Item>>}
   */
  public getSetItems(setId: string): Observable<PaginatedList<Item>> {
    const findListOptions: FindListOptions = {};
    return this.deduplicationSetItemsRestService
      .getItemsPerSet(
        findListOptions,
        setId,
        followLink('bundles', {}, followLink('bitstreams')),
        followLink('owningCollection')
      )
      .pipe(
        getFirstCompletedRemoteData(),
        map((rd: RemoteData<PaginatedList<Item>>) => {
          if (rd.hasSucceeded) {
            return rd.payload;
          } else {
            throw new Error("Can't retrieve items per set from REST service");
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
  ): Observable<RemoteData<NoContent>> {
    return this.deduplicationSetItemsRestService
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
   * Get Owning Collection of the item
   * @param href The _links of the item
   * @returns the collection of the item
   */
  public getItemOwningCollection(
    href: string
  ): Observable<RemoteData<Collection>> {
    return this.collectionDataService.findByHref(href);
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
  public getSubmissionWorkflowItems(
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
      .pipe(getFirstCompletedRemoteData(), take(1));
  }
}
