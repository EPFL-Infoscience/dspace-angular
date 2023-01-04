import { MergeSetItems } from './../interfaces/deduplication-merge.models';
import { MergeObject } from './../../core/deduplication/models/merge-object.model';
import { SubmissionRepeatableFieldsRestService } from './../../core/deduplication/services/submission-repeatable-fields-rest.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { ItemDataService } from './../../core/data/item-data.service';
import { Collection } from './../../core/shared/collection.model';
import { Item } from './../../core/shared/item.model';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';

import { DeduplicationItemsService } from './deduplication-items.service';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { getMockTranslateService } from '../../shared/mocks/translate.service.mock';
import { DeduplicationMergeRestService } from '../../core/deduplication/services/deduplication-merge-rest.service';
import { SubmissionRepeatableFieldsObject } from '../../core/deduplication/models/submission-repeatable-fields.model';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { cold } from 'jasmine-marbles';

describe('DeduplicationItemsService', () => {
  let service: DeduplicationItemsService;
  let serviceAsAny: any;
  let itemDataService: any;
  let mergeService: any;
  let submissionRepeatableFieldsService: any;
  let notificationSerice: any;
  let itemRD$: any;
  let testItem: Item;
  let testCollection;
  const mergeObj = new MergeObject();
  const submissionObj = new SubmissionRepeatableFieldsObject();
  const mergeObjRD$ = createSuccessfulRemoteDataObject$(mergeObj);
  const submissionObjRD$ = createSuccessfulRemoteDataObject$(submissionObj);


  const itemUUID = '04dd18fc-03f9-4b9a-9304-ed7c313686d3';
  const collectionUUID = '91dfa5b5-5440-4fb4-b869-02610342f886';
  const collectionPath = '/collections/';
  const itemPath = '/items/';

  const setItemObj: MergeSetItems = {
    setId: 'title:d4b9185f91391c0574f4c3dbdd6fa7d3',
    bitstreams: [],
    mergedItems: [],
    metadata: []
  };

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

    itemRD$ = createSuccessfulRemoteDataObject$(testItem);

    itemDataService = {
      findById: () => itemRD$,
      findByHref: () => itemRD$,
    };

    mergeService = {
      mergeItemsData: () => mergeObjRD$,
    };

    submissionRepeatableFieldsService = {
      getSubmissionRepeatableFields: createSuccessfulRemoteDataObject$(new SubmissionRepeatableFieldsObject()),
    };

    notificationSerice = new NotificationsServiceStub();
  }

  beforeEach(waitForAsync(async () => {
    init();
    await TestBed.configureTestingModule({
      providers: [
        DeduplicationItemsService,
        { provide: TranslateService, useValue: getMockTranslateService() },
        { provide: ItemDataService, useValue: itemDataService },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: DeduplicationMergeRestService, useValue: mergeService },
        { provide: SubmissionRepeatableFieldsRestService, useValue: submissionRepeatableFieldsService },
      ]
    }).compileComponents();

    service = new DeduplicationItemsService(
      itemDataService,
      mergeService,
      submissionRepeatableFieldsService,
      notificationSerice,
      getMockTranslateService()
    );
    serviceAsAny = service;
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get item data', () => {
    beforeEach(() => {
      spyOn(serviceAsAny.itemDataService, 'findById').and.returnValue(itemRD$);
      spyOn(serviceAsAny.itemDataService, 'findByHref').and.returnValue(itemRD$);
    });

    const linksToFollow = [followLink('bundles', {}, followLink('bitstreams')), followLink('owningCollection')];

    it('should proxy the call to getItemData', () => {
      const result = service.getItemData(itemUUID);
      expect((service as any).itemDataService.findById).toHaveBeenCalledWith(itemUUID, true, true, ...linksToFollow);

      const expected = cold('(a|)', {
        a: testItem
      });
      expect(result).toBeObservable(expected);
    });

    it('should proxy the call to getItemByHref', () => {
      const href = 'http://resp.api/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d';
      const result = service.getItemByHref(href);
      expect((service as any).itemDataService.findByHref).toHaveBeenCalledWith(href, true, true, ...linksToFollow);

      const expected = cold('(a|)', {
        a: testItem
      });
      expect(result).toBeObservable(expected);
    });
  });

  describe('merge Data', () => {
    beforeEach(() => {
      spyOn(serviceAsAny.mergeService, 'mergeItemsData').and.returnValue(mergeObjRD$);
      spyOn(serviceAsAny.submissionRepeatableFieldsService, 'getSubmissionRepeatableFields').and.returnValue(submissionObjRD$);
    });

    it('should proxy the call to mergeData', () => {
      const result = service.mergeData(setItemObj, itemUUID);
      expect((service as any).mergeService.mergeItemsData).toHaveBeenCalledWith(setItemObj, itemUUID);
      const expected = cold('(a|)', {
        a: mergeObj
      });
      expect(result).toBeObservable(expected);
    });

    it('should proxy the call to getRepeatableFields', () => {
      const result = service.getRepeatableFields(itemUUID);
      expect((service as any).submissionRepeatableFieldsService.getSubmissionRepeatableFields).toHaveBeenCalledWith(itemUUID);
      const expected = cold('(a|)', {
        a: submissionObj
      });
      expect(result).toBeObservable(expected);
    });
  });
});
