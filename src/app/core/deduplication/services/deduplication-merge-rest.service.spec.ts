import { ItemsMetadataField } from './../../../deduplication/interfaces/deduplication-merge.models';
import { MergeObject } from './../models/merge-object.model';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { TestBed } from '@angular/core/testing';

import { DeduplicationMergeRestService } from './deduplication-merge-rest.service';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { RequestService } from '../../data/request.service';
import { TestScheduler } from 'rxjs/testing';
import { getTestScheduler } from 'jasmine-marbles';
import { RestResponse } from '../../cache/response.models';
import { take } from 'rxjs/operators';
import { RequestEntry } from '../../data/request-entry.model';
import { getMockRequestService } from './../../../shared/mocks/request.service.mock';
import { getMockRemoteDataBuildService } from './../../../shared/mocks/remote-data-build.service.mock';
import { PutRequest } from '../../data/request.models';
import { HALEndpointServiceStub } from './../../../shared/testing/hal-endpoint-service.stub';

describe('DeduplicationMergeRestService', () => {
  let service: DeduplicationMergeRestService;
  let scheduler: TestScheduler;
  let responseCacheEntry: RequestEntry;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;

  const endpointURL = 'https://rest.api/rest/api/deduplications/merge';
  const targetItemId = 'fake-id';
  const metadataFields: ItemsMetadataField[] = [
    {
      metadataField: 'dc.title',
      sources: [{
        item: '',
        place: 0,
      }]
    }
  ];
  const mergeData: MergeObject = Object.assign(new MergeObject(), {
    setId: '2f4c613a-5a4b-438b-9686-be1d5b4a1g5d',
    bitstreams: [],
    mergedItems: [],
    metadata: metadataFields
  });

  beforeEach(() => {
    scheduler = getTestScheduler();
    responseCacheEntry = new RequestEntry();
    responseCacheEntry.response = new RestResponse(true, 200, 'Success');
    requestService = getMockRequestService();

    rdbService = getMockRemoteDataBuildService();

    objectCache = {} as ObjectCacheService;
    halService = Object.assign(new HALEndpointServiceStub(endpointURL));
    notificationsService = {} as NotificationsService;

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
    );
  });

  describe('mergeData', () => {
    beforeEach(() => {
      service.mergeItemsData(mergeData,targetItemId);
    });

    it('should proxy the call to dataService.put', () => {
      service.mergeItemsData(mergeData, targetItemId).pipe(take(1)).subscribe(
        (res) => {
          expect(requestService.send).toHaveBeenCalledWith(jasmine.any(PutRequest));
          expect(res).toBeDefined();
        }
      );
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
