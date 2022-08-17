import { SubmissionRepeatableFieldsObject } from './../../core/deduplication/models/submission-repeatable-fields.model';
import { SubmissionRepeatableFieldsRestService } from './../../core/deduplication/services/submission-repeatable-fields-rest.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { RemoteData } from './../../core/data/remote-data';
import { MergeObject } from './../../core/deduplication/models/merge-object.model';
import { map } from 'rxjs/operators';
import { DeduplicationMergeRestService } from './../../core/deduplication/services/deduplication-merge-rest.service';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload
} from './../../core/shared/operators';
import { followLink } from './../../shared/utils/follow-link-config.model';
import { Item } from './../../core/shared/item.model';
import { ItemDataService } from './../../core/data/item-data.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MergeItems } from '../interfaces/deduplication-merge.models';
@Injectable()
export class DeduplicationItemsService {
  constructor(
    private itemDataService: ItemDataService,
    private mergeService: DeduplicationMergeRestService,
    private submissionRepeatableFieldsService: SubmissionRepeatableFieldsRestService,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) { }

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

  public mergeData(
    data: MergeItems,
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
        if (response.hasFailed) {
          // TODO: add error message
          // if (isEqual(response.statusCode, 422)) {
          //   // Unprocessable Entity
          //   this.notificationsService.error(null, 'Merge failed. Please check the selected values');
          // } else
          this.notificationsService.error(
            null,
            this.translate.get('deduplication.merge.notification.message-error')
          );
        }
      })
    );
  }



  /**
   * GET the repeatable fields for the given item id
   * @param itemId The target item's id
   * @returns
   */
  getRepeatableFields(itemId: string) {
    return this.submissionRepeatableFieldsService
      .getSubmissionRepeatableFields(itemId)
      .pipe(
        getFirstCompletedRemoteData(),
        map(
          (rd: RemoteData<SubmissionRepeatableFieldsObject>) => {
            if (rd.hasSucceeded) {
              return rd.payload;
            } else {
              throw new Error(
                "Can't retrieve SubmissionRepeatableFieldsObject from REST service"
              );
            }
          }
        )
      );
  }
}
