import { MergeItemsFromCompare } from './../interfaces/deduplication-merge.models';
import { isEqual } from 'lodash';
import { SubmissionRepeatableFieldsObject } from './../../core/deduplication/models/submission-repeatable-fields.model';
import { SubmissionRepeatableFieldsRestService } from './../../core/deduplication/services/submission-repeatable-fields-rest.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { RemoteData } from './../../core/data/remote-data';
import { MergeObject } from './../../core/deduplication/models/merge-object.model';
import { map } from 'rxjs/operators';
import { DeduplicationMergeRestService } from './../../core/deduplication/services/deduplication-merge-rest.service';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
} from './../../core/shared/operators';
import { followLink } from './../../shared/utils/follow-link-config.model';
import { Item } from './../../core/shared/item.model';
import { ItemDataService } from './../../core/data/item-data.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MergeSetItems } from '../interfaces/deduplication-merge.models';
import { FindListOptions } from '../../core/data/request.models';
import { RequestParam } from '../../core/cache/models/request-param.model';
@Injectable()
export class DeduplicationItemsService {
  constructor(
    private itemDataService: ItemDataService,
    private mergeService: DeduplicationMergeRestService,
    private submissionRepeatableFieldsService: SubmissionRepeatableFieldsRestService,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) { }

  /**
   * Get item by item identifier.
   * @param itemId The item's UUID.
   * @returns {Observable<Item>}
   */
  public getItemData(itemId: string): Observable<Item> {
    return this.itemDataService
      .findById(
        itemId,
        true,
        true,
        followLink('bundles', {}, followLink('bitstreams')),
        followLink('owningCollection')
      )
      .pipe(getFirstSucceededRemoteDataPayload());
  }

  getItemByHref(href: string): Observable<Item> {
    return this.itemDataService.findByHref(href,
      true,
      true,
      followLink('bundles', {}, followLink('bitstreams')),
      followLink('owningCollection')).pipe(
        getFirstSucceededRemoteDataPayload()
      );
  }

  /**
   * PUT call to merge the data
   * @param data data to be merged
   * @param targetItemId target item uuid
   * @returns {Observable<MergeObject>}
   */
  public mergeData(
    data: MergeSetItems | MergeItemsFromCompare,
    targetItemId: string
  ): Observable<MergeObject> {
    return this.mergeService.mergeItemsData(data, targetItemId).pipe(
      getFirstCompletedRemoteData(),
      map((response: RemoteData<MergeObject>) => {
        if (response.hasSucceeded) {
          this.notificationsService.success(
            null,
            this.translate.get(
              'deduplication.merge.notification.message-success'
            )
          );
          return response.payload;
        }

        if (isEqual(response.statusCode, 422)) {
          // Unprocessable Entity
          this.notificationsService.error(
            null,
            this.translate.get(
              'deduplication.merge.notification.message-error-422'
            )
          );
          throw new Error('Merge Failed with status 422');
        }

        if (response.hasFailed && isEqual(response.statusCode, 500)) {
          this.notificationsService.error(
            null,
            this.translate.get('deduplication.merge.notification.message-error')
          );
          throw new Error('Merge Failed with status 500');
        }

        if (response.hasFailed && isEqual(response.statusCode, 400)) {
          this.notificationsService.error(
            null,
            this.translate.get('deduplication.merge.notification.message-error-400')
          );
          throw new Error('Merge Failed with status 400');
        }
      })
    );
  }

  /**
   * GET the repeatable fields for the given item id
   * @param itemId The target item's id
   * @returns {Observable<SubmissionRepeatableFieldsObject>}
   */
  getRepeatableFields(itemId: string): Observable<SubmissionRepeatableFieldsObject> {
    const options = new FindListOptions();
    options.searchParams = [
      new RequestParam('uuid', itemId)
    ];
    return this.submissionRepeatableFieldsService
      .getSubmissionRepeatableFields(itemId)
      .pipe(
        getFirstCompletedRemoteData(),
        map((rd: RemoteData<SubmissionRepeatableFieldsObject>) => {
          if (rd.hasSucceeded) {
            return rd.payload;
          } else {
            // throw new Error(
            //   "Can't retrieve Repeatable Fields from REST service"
            // );
            console.error("Can't retrieve Repeatable Fields from REST service");
          }
        })
      );
  }
}
