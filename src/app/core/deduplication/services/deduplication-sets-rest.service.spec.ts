import { HttpClient } from '@angular/common/http';

import { TestScheduler } from 'rxjs/testing';
import { of as observableOf } from 'rxjs';
import { getTestScheduler, cold } from 'jasmine-marbles';

import { RequestService } from '../../data/request.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RestResponse } from '../../cache/response.models';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject } from '../../../shared/remote-data.utils';
import { mockSetObject } from '../../../shared/mocks/deduplication.mock';
import { PaginatedList } from '../../data/paginated-list.model';
import { RequestEntry } from '../../data/request-entry.model';
import { DeduplicationSetsRestService } from './deduplication-sets-rest.service';

describe('DeduplicationSetsRestService', () => {
  let scheduler: TestScheduler;
  let service: DeduplicationSetsRestService;
  let responseCacheEntry: RequestEntry;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;
  let http: HttpClient;
  let comparator: any;

  const endpointURL = 'https://rest.api/rest/api/deduplications/sets/title:d5144968f1c7bbff30af48960f28ead6';
  const requestUUID = 'd5144968f1c7bbff30af48960f28ead6';
  const setChecksum = 'd5144968f1c7bbff30af48960f28ead6';
  const signatureId = 'title';

  const paginatedList = new PaginatedList();
  const setObjectRD = createSuccessfulRemoteDataObject(mockSetObject);
  const paginatedListRD = createSuccessfulRemoteDataObject(paginatedList);

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
      getByUUID: observableOf(responseCacheEntry),
    });

    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: cold('(a)', {
        a: setObjectRD
      }),
      buildList: cold('(a)', {
        a: paginatedListRD
      }),
    });

    objectCache = {} as ObjectCacheService;
    halService = jasmine.createSpyObj('halService', {
      getEndpoint: cold('a|', { a: endpointURL })
    });

    notificationsService = {} as NotificationsService;
    http = {} as HttpClient;
    comparator = {} as any;

    service = new DeduplicationSetsRestService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
      http,
      comparator
    );

    spyOn((service as any).dataService, 'getSearchByHref').and.callThrough();
    spyOn((service as any).dataService, 'delete').and.callThrough();
  });

  describe('getSignatures', () => {
    it('should proxy the call to dataservice.getSearchByHref', (done) => {
      service.getSetsPerSignature().subscribe(
        (res) => {
          expect((service as any).dataService.getSearchByHref).toHaveBeenCalledWith(endpointURL, {}, {});
        }
      );
      done();
    });

    it('should proxy the call to dataservice.getSearchByHref / findBySignature', (done) => {
      service.getSetsfindBySignature().subscribe(
        (res) => {
          expect((service as any).dataService.getSearchByHref).toHaveBeenCalledWith(endpointURL, {}, {});
        }
      );
      done();
    });

    it('should proxy the call to dataservice.delete / deleteSet', (done) => {
      service.deleteSet(signatureId, setChecksum).subscribe(
        (res) => {
          expect((service as any).dataService.getSearchByHref).toHaveBeenCalledWith(`${signatureId}:${setChecksum}`);
        }
      );
      done();
    });
  });
});
