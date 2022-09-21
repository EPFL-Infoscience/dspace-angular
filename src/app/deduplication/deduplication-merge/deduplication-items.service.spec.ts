import { SubmissionRepeatableFieldsRestService } from './../../core/deduplication/services/submission-repeatable-fields-rest.service';
import { NotificationsServiceStub } from 'src/app/shared/testing/notifications-service.stub';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { ItemDataService } from './../../core/data/item-data.service';
import { Collection } from './../../core/shared/collection.model';
import { Item } from './../../core/shared/item.model';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';

import { DeduplicationItemsService } from './deduplication-items.service';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { getMockTranslateService } from 'src/app/shared/mocks/translate.service.mock';
import { DeduplicationMergeRestService } from 'src/app/core/deduplication/services/deduplication-merge-rest.service';

describe('DeduplicationItemsService', () => {
  let service: DeduplicationItemsService;
  let itemDataService: any;

  let testItem;
  let testCollection;

  let itemUUID = '04dd18fc-03f9-4b9a-9304-ed7c313686d3';
  let collectionUUID = '91dfa5b5-5440-4fb4-b869-02610342f886';

  let collectionPath = '/collections/';
  let itemPath = '/items/';

  function init() {
    testCollection = Object.assign(new Collection(),
      {
        type: 'collection',
        metadata: {
          'dc.title': [{ value: 'collection' }]
        },
        uuid: collectionUUID,
        parentCommunity: null,
        _links: {
          self: collectionPath + collectionUUID
        }
      }
    );

    testItem = Object.assign(new Item(),
      {
        type: 'item',
        metadata: {
          'dc.title': [{ value: 'item' }]
        },
        uuid: itemUUID,
        owningCollection: createSuccessfulRemoteDataObject$(testCollection),
        _links: {
          owningCollection: collectionPath + collectionUUID,
          self: itemPath + itemUUID
        }
      }
    );

    itemDataService = {
      findById: (id: string) => createSuccessfulRemoteDataObject$(testItem)
    };
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule({
      providers: [
        DeduplicationItemsService,
        { provide: TranslateService, useValue: getMockTranslateService() },
        { provide: ItemDataService, useValue: itemDataService },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: DeduplicationMergeRestService, useValue: {} },
        { provide: SubmissionRepeatableFieldsRestService, useValue: {} },
      ]
    }).compileComponents();

    service = TestBed.inject(DeduplicationItemsService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
