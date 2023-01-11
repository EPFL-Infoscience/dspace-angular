import { TestScheduler } from 'rxjs/testing';
import { getTestScheduler } from 'jasmine-marbles';

import { RequestService } from '../../data/request.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RestResponse } from '../../cache/response.models';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { PaginatedList } from '../../data/paginated-list.model';
import { RequestEntry } from '../../data/request-entry.model';
import { DeduplicationSetsRestService } from './deduplication-sets-rest.service';
import { getMockRequestService } from './../../../shared/mocks/request.service.mock';
import { HALEndpointServiceStub } from './../../../shared/testing/hal-endpoint-service.stub';
import { Observable } from 'rxjs';
import { RemoteData } from '../../data/remote-data';
import { SetObject } from '../models/set.model';
import { NoContent } from '../../shared/NoContent.model';
import { getMockRemoteDataBuildService } from './../../../shared/mocks/remote-data-build.service.mock';

describe('DeduplicationSetsRestService', () => {
  let scheduler: TestScheduler;
  let service: DeduplicationSetsRestService;
  let responseCacheEntry: RequestEntry;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;

  const endpointURL = 'https://rest.api/rest/api/deduplications/sets/title:d5144968f1c7bbff30af48960f28ead6';
  const setChecksum = 'd5144968f1c7bbff30af48960f28ead6';
  const signatureId = 'title';

  beforeEach(() => {
    scheduler = getTestScheduler();
    responseCacheEntry = new RequestEntry();
    responseCacheEntry.response = new RestResponse(true, 200, 'Success');
    requestService = getMockRequestService();
    rdbService = getMockRemoteDataBuildService();
    objectCache = {} as ObjectCacheService;
    halService = Object.assign(new HALEndpointServiceStub('fake-url'));
    notificationsService = {} as NotificationsService;

    service = new DeduplicationSetsRestService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
    );
  });


  describe('getSignatures', () => {
    let res: Observable<RemoteData<PaginatedList<SetObject>>>;
    beforeEach(() => {
      res = service.getSetsPerSignature();
    });
    it('should proxy the call to getSearchByHref', () => {
      res.subscribe(
        () => {
          expect((service as any).searchData.getSearchByHref).toHaveBeenCalledWith(endpointURL, {}, {});
        }
      );
    });
  });

  describe('findBySignature', () => {
    let res: Observable<RemoteData<PaginatedList<SetObject>>>;
    beforeEach(() => {
      res = service.getSetsFindBySignature();
    });
    it('should proxy the call to dataservice.getSearchByHref / findBySignature', () => {
      res.subscribe(
        () => {
          expect((service as any).searchData.getSearchByHref).toHaveBeenCalledWith(endpointURL, {}, {});
        }
      );
    });
  });

  describe('deleteSet', () => {
    let res: Observable<RemoteData<NoContent>>;
    beforeEach(() => {
      res = service.deleteSet(signatureId, setChecksum);
    });
    it('should proxy the call to dataservice.getSearchByHref / findBySignature', () => {
      res.subscribe(
        () => {
           expect(requestService.send).toHaveBeenCalled();
        });
    });
  });

  describe('remove items from set', () => {
    let res: Observable<RemoteData<NoContent>>;
    beforeEach(() => {
      res = service.removeItem(signatureId, 'fake-item-id', setChecksum);
    });
    it('should proxy the call to dataservice.getSearchByHref / findBySignature', () => {
      res.subscribe(
        () => {
          expect(requestService.send).toHaveBeenCalled();
        });
    });
  });
});
