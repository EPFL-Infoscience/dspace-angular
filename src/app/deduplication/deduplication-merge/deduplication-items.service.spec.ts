import { RequestParam } from './../../core/cache/models/request-param.model';
import { FindListOptions } from './../../core/data/find-list-options.model';
import { MergeObject } from './../../core/deduplication/models/merge-object.model';
import { SubmissionFieldsRestService } from '../../core/deduplication/services/submission-fields-rest.service';
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
import { SubmissionFieldsObject } from '../../core/deduplication/models/submission-fields.model';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { cold } from 'jasmine-marbles';

describe('DeduplicationItemsService', () => {
  let service: DeduplicationItemsService;
  let serviceAsAny: any;
  let itemDataService: any;
  let mergeService: any;
  let submissionFieldsService: any;
  let notificationService: any;
  let itemRD$: any;
  let testItem: Item;
  let testCollection;
  const mergeObj = Object.assign(new MergeObject() , {
    processId: 1234,
  });
  const submissionObj = new SubmissionFieldsObject();
  const mergeObjRD$ = createSuccessfulRemoteDataObject$(mergeObj);
  const submissionObjRD$ = createSuccessfulRemoteDataObject$(submissionObj);


  const itemUUID = '04dd18fc-03f9-4b9a-9304-ed7c313686d3';
  const collectionUUID = '91dfa5b5-5440-4fb4-b869-02610342f886';
  const collectionPath = '/collections/';
  const itemPath = '/items/';

  const setItemObj: MergeObject = Object.assign(new MergeObject(), {
    setId: 'title:d4b9185f91391c0574f4c3dbdd6fa7d3',
    bitstreams: [],
    mergedItems: [],
    metadata: [],
  });

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

    submissionFieldsService = {
      getSubmissionFields: createSuccessfulRemoteDataObject$(new SubmissionFieldsObject()),
    };

    notificationService = new NotificationsServiceStub();
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
        { provide: SubmissionFieldsRestService, useValue: submissionFieldsService },
      ]
    }).compileComponents();

    service = new DeduplicationItemsService(
      itemDataService,
      mergeService,
      submissionFieldsService,
      notificationService,
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
      expect((service as any).itemDataService.findById).toHaveBeenCalledWith(itemUUID, false, true, ...linksToFollow);

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
      spyOn(serviceAsAny.submissionFieldsService, 'getSubmissionFields').and.returnValue(submissionObjRD$);
    });

    it('should proxy the call to mergeData', () => {
      const result = service.mergeData(setItemObj, itemUUID);
      expect((service as any).mergeService.mergeItemsData).toHaveBeenCalledWith(setItemObj, itemUUID);
      const expected = cold('(a|)', {
        a: mergeObj
      });
      expect(result).toBeObservable(expected);
    });

    it('should proxy the call to getSubmissionFields', () => {
      const result = service.getSubmissionFields(itemUUID);
      const options: FindListOptions = Object.assign(new FindListOptions(), {
        searchParams: [new RequestParam('uuid', '04dd18fc-03f9-4b9a-9304-ed7c313686d3')]
      });
      expect((service as any).submissionFieldsService.getSubmissionFields).toHaveBeenCalledWith(itemUUID, options);
      const expected = cold('(a|)', {
        a: submissionObj
      });
      expect(result).toBeObservable(expected);
    });

    it('should notify the success and check for the related process notification', (done) => {
      service.mergeData(setItemObj, itemUUID).subscribe(() => {
        expect(notificationService.process).toHaveBeenCalled();
        expect(notificationService.success).toHaveBeenCalled();
        done();
      });
    });

  });
});
