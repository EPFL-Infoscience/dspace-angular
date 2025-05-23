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
import { DeduplicationRestService } from './deduplication-rest.service';
import { mockSignatureObjectTitle, mockSignatureObjectIdentifier } from '../../../shared/mocks/deduplication.mock';
import { PaginatedList } from '../../data/paginated-list.model';
import { PageInfo } from '../../shared/page-info.model';
import { RequestEntry } from '../../data/request-entry.model';

describe('DeduplicationRestService', () => {
  let scheduler: TestScheduler;
  let service: DeduplicationRestService;
  let responseCacheEntry: RequestEntry;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;

  const endpointURL = 'https://rest.api/rest/api/deduplications/signatures';
  const requestUUID = '8b3c613a-5a4b-438b-9686-be1d5b4a1c5a';


  const pageInfo = new PageInfo();
  const array = [mockSignatureObjectTitle, mockSignatureObjectIdentifier];  const paginatedList = new PaginatedList();
  const signatureObjectRD = createSuccessfulRemoteDataObject(mockSignatureObjectTitle);
  const paginatedListRD = createSuccessfulRemoteDataObject(paginatedList);

  beforeEach(() => {
    scheduler = getTestScheduler();

    responseCacheEntry = new RequestEntry();
    responseCacheEntry.response = new RestResponse(true, 200, 'Success');
    requestService = jasmine.createSpyObj('requestService', {
      send:{},
      generateRequestId: requestUUID,
      configure: true,
      removeByHrefSubstring: {},
      getByHref: observableOf(responseCacheEntry),
      getByUUID: observableOf(responseCacheEntry),
    });

    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: cold('(a)', {
        a: signatureObjectRD
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

    service = new DeduplicationRestService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
    );

  });

  describe('getSignatures', () => {
    it('should proxy the call to dataservice.findAllByHref', (done) => {
      service.getSignatures().subscribe(
        (res) => {
          expect((service as any).searchData.findAllByHref).toHaveBeenCalledWith(endpointURL, {}, true, true);
        }
      );
      done();
    });
  });
});
