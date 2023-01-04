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
import { mockSubmissionRepeatableFieldsObject } from '../../../shared/mocks/deduplication.mock';
import { SubmissionFieldsRestService } from './submission-fields-rest.service';
import { RequestEntry } from '../../data/request-entry.model';

describe('SubmissionFieldsRestService', () => {
  let scheduler: TestScheduler;
  let service: SubmissionFieldsRestService;
  let responseCacheEntry: RequestEntry;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;
  let http: HttpClient;
  let comparator: any;

  const endpointURL = 'https://rest.api/server/api/config/submissionfields/search/findByItem?231d6608-0847-4f4b-ac5f-c6058ce6a73d';
  const requestUUID = '8b3c613a-5a4b-438b-9686-be1d5b4a2dp2';
  const itemUUID = '231d6608-0847-4f4b-ac5f-c6058ce6a73d';

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
      send: {}
    });

    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: cold('(a)', {
        a: mockSubmissionRepeatableFieldsObject,
      }),
    });

    objectCache = {} as ObjectCacheService;
    halService = jasmine.createSpyObj('halService', {
      getEndpoint: cold('a|', { a: endpointURL }),
    });

    notificationsService = {} as NotificationsService;
    http = {} as HttpClient;
    comparator = {} as any;

    service = new SubmissionFieldsRestService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
      http,
      comparator
    );
  });

  describe('getSubmissionFields', () => {
    it('should return a RemoteData<SubmissionFieldsObject>', () => {
      const res$ = service.getSubmissionFields(itemUUID);
      expect(res$).toBeObservable(
        cold('(a)', {
          a: mockSubmissionRepeatableFieldsObject,
        })
      );
    });
  });
});
