import { ItemsMetadataField, MergeSetItems } from './../../../deduplication/interfaces/deduplication-merge.models';
import { MergeObject } from './../models/merge-object.model';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { DeduplicationMergeRestService } from './deduplication-merge-rest.service';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { RequestService } from '../../data/request.service';
import { TestScheduler } from 'rxjs/testing';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { RestResponse } from '../../cache/response.models';
import { createSuccessfulRemoteDataObject } from '../../../shared/remote-data.utils';
import { of as observableOf } from 'rxjs';
import { take } from 'rxjs/operators';
import { RequestEntry } from '../../data/request-entry.model';

describe('DeduplicationMergeRestService', () => {
  let service: DeduplicationMergeRestService;
  let scheduler: TestScheduler;
  let responseCacheEntry: RequestEntry;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;
  let http: HttpClient;
  let comparator: any;

  const linkPath = 'merge';
  const endpointURL = 'https://rest.api/rest/api/deduplications/merge';
  const requestUUID = '8b3c613a-5a4b-438b-9686-be1d5b4a1c5a';
  const mergeObjectRD = createSuccessfulRemoteDataObject(new MergeObject());
  const metadataFields: ItemsMetadataField[] = [
    {
      metadataField: 'dc.title',
      sources: [{
        item: '',
        place: 0,
      }]
    }
  ];
  const mergeData: MergeSetItems = {
    setId: '2f4c613a-5a4b-438b-9686-be1d5b4a1g5d',
    bitstreams: [],
    mergedItems: [],
    metadata: metadataFields
  };

  beforeEach(() => {
    scheduler = getTestScheduler();
    responseCacheEntry = new RequestEntry();
    responseCacheEntry.response = new RestResponse(true, 200, 'Success');
    requestService = jasmine.createSpyObj('requestService', {
      send: {},
      generateRequestId: requestUUID,
      configure: true,
      removeByHrefSubstring: {},
      getByHref: observableOf(responseCacheEntry),
      getByUUID: observableOf(responseCacheEntry)
    });

    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: cold('(a)', {
        a: mergeObjectRD
      }),
      buildFromRequestUUID: observableOf(responseCacheEntry),
    });

    objectCache = {} as ObjectCacheService;
    halService = jasmine.createSpyObj('halService', {
      getEndpoint: cold('a|', { a: endpointURL })
    });
    notificationsService = {} as NotificationsService;
    http = {} as HttpClient;
    comparator = {} as any;
    TestBed.configureTestingModule({
      providers: [
        DeduplicationMergeRestService,

      ]
    });
    service = new DeduplicationMergeRestService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
      http,
      comparator
    );
  });

  describe('mergeData', () => {
    beforeEach(() => {
       spyOn((service as any).dataService, 'put').and.callThrough();
    });

    it('should proxy the call to dataService.put', () => {
      service.mergeItemsData(mergeData, requestUUID).pipe(take(1)).subscribe(
        (res) => {
          expect(res).toBeDefined();
        }
      );
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
