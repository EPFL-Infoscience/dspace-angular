import { RequestParam } from './../../core/cache/models/request-param.model';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { RemoteData } from './../../core/data/remote-data';
import { MergeObject } from './../../core/deduplication/models/merge-object.model';
import { map } from 'rxjs/operators';
import { MergeItems } from './deduplication-merge.component';
import { DeduplicationMergeRestService } from './../../core/deduplication/services/deduplication-merge-rest.service';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
  getAllCompletedRemoteData
} from './../../core/shared/operators';
import { followLink } from './../../shared/utils/follow-link-config.model';
import { Item } from './../../core/shared/item.model';
import { ItemDataService } from './../../core/data/item-data.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CollectionSubmissionDefinitionsConfigService } from 'src/app/core/config/collection-submission-definitions-config.service';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { ConfigObject } from 'src/app/core/config/models/config.model';

@Injectable()
export class DeduplicationItemsService {
  constructor(
    private itemDataService: ItemDataService,
    private mergeService: DeduplicationMergeRestService,
    private notificationsService: NotificationsService,
    private submissionDefinitionsService: CollectionSubmissionDefinitionsConfigService,
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
      ).pipe(
        getFirstSucceededRemoteDataPayload()
      );
  }

  getCollectionSubmissionDefinition(collectionId: string) {
    return this.submissionDefinitionsService.findByCollection(
      {
        searchParams:
          [
            new RequestParam('uuid', collectionId),
            new RequestParam('embed', 'sections'),
          ]
      }
    ).pipe(
      getAllCompletedRemoteData(),
      map((rd: RemoteData<PaginatedList<ConfigObject>>) => {
        if (rd.hasFailed) {
          throw new Error(`Couldn't retrieve the config`);
        } else {
          return rd;
        }
      })
    );
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
}
