import { HttpClient } from '@angular/common/http';

import { TestScheduler } from 'rxjs/testing';
import { of as observableOf, Observable } from 'rxjs';
import { getTestScheduler, cold, hot } from 'jasmine-marbles';

import { RequestService } from '../data/request.service';
import { PaginatedList } from '../data/paginated-list';
import { RequestEntry } from '../data/request.reducer';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { RestResponse } from '../cache/response.models';
import { PageInfo } from '../shared/page-info.model';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { ResourceType } from '../shared/resource-type';
import { createSuccessfulRemoteDataObject } from '../../shared/remote-data.utils';
import { SignatureObject } from './models/signature.model';
import { DeduplicationRestService } from './deduplication-rest.service';

describe('DeduplicationRestService', () => {
  let scheduler: TestScheduler;
  let service: DeduplicationRestService;
  let responseCacheEntry: RequestEntry;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;
  let http: HttpClient;
  let comparator: any;

  const signatureObjectTitle: SignatureObject = {
    type: new ResourceType('signature'),
    id: 'title',
    signatureType: 'title',
    groupReviewerCheck: 20,
    groupSubmitterCheck: 35,
    groupAdminstratorCheck: 41,
    _links: {
      self: {
        href: 'http://rest.api/rest/api/deduplications/signatures/title'
      }
    }
  };

  const signatureObjectIdentifier: SignatureObject = {
    type: new ResourceType('signature'),
    id: 'identifier',
    signatureType: 'identifier',
    groupReviewerCheck: 12,
    groupSubmitterCheck: 71,
    groupAdminstratorCheck: 5,
    _links: {
      self: {
        href: 'http://rest.api/rest/api/deduplications/signatures/identifier'
      }
    }
  };

  const endpointURL = 'https://rest.api/rest/api/deduplications/signatures';
  const requestUUID = '8b3c613a-5a4b-438b-9686-be1d5b4a1c5a';
  const requestURL = 'https://rest.api/rest/api/deduplications/';

  const pageInfo = new PageInfo();
  const array = [ signatureObjectTitle, signatureObjectIdentifier ];
  const paginatedList = new PaginatedList(pageInfo, array);
  const signatureObjectRD = createSuccessfulRemoteDataObject(signatureObjectTitle);
  const paginatedListRD = createSuccessfulRemoteDataObject(paginatedList);

  beforeEach(() => {
    scheduler = getTestScheduler();

    responseCacheEntry = new RequestEntry();
    responseCacheEntry.response = new RestResponse(true, 200, 'Success');
    requestService = jasmine.createSpyObj('requestService', {
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
    http = {} as HttpClient;
    comparator = {} as any;

    service = new DeduplicationRestService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
      http,
      comparator
    );

    spyOn((service as any).dataService, 'findAllByHref').and.callThrough();
    spyOn((service as any).dataService, 'findByHref').and.callThrough();
  });

  describe('getSignatures', () => {
    it('should proxy the call to dataservice.findAllByHref', () => {
      service.getSignatures().subscribe(
        (res) => {
          expect((service as any).dataService.findAllByHref).toHaveBeenCalledWith(endpointURL, {});
        }
      );
    });

    it('should return a RemoteData<PaginatedList<SignatureObject>> for the object with the given URL', () => {
      const result = service.getSignatures();
      const expected = cold('(a)', {
        a: paginatedListRD
      });
      expect(result).toBeObservable(expected);
    });
  });

  describe('getSignature', () => {
    it('should proxy the call to dataservice.findByHref', () => {
      service.getSignature(signatureObjectTitle.id).subscribe(
        (res) => {
          expect((service as any).dataService.findByHref).toHaveBeenCalledWith(endpointURL + '/' + signatureObjectTitle.id);
        }
      );
    });

    it('should return a RemoteData<SignatureObject> for the object with the given URL', () => {
      const result = service.getSignature(signatureObjectTitle.id);
      const expected = cold('(a)', {
        a: signatureObjectRD
      });
      expect(result).toBeObservable(expected);
    });
  });

});
