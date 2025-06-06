import { FindListOptions } from './../../core/data/find-list-options.model';
import { TestBed } from '@angular/core/testing';
import { of as observableOf } from 'rxjs';
import { DeduplicationSignaturesService } from './deduplication-signatures.service';
import { SortOptions, SortDirection } from '../../core/cache/models/sort-options.model';
import { DeduplicationRestService } from '../../core/deduplication/services/deduplication-rest.service';
import {
  getMockDeduplicationRestService,
} from '../../shared/mocks/deduplication.mock';
import { createSuccessfulRemoteDataObject } from '../../shared/remote-data.utils';
import { cold } from 'jasmine-marbles';
import { PaginatedList } from '../../core/data/paginated-list.model';

describe('DeduplicationSignaturesService', () => {
  let service: DeduplicationSignaturesService;
  let restService: DeduplicationRestService;
  let serviceAsAny: any;
  let restServiceAsAny: any;

  const paginatedList = new PaginatedList();
  const paginatedListRD = createSuccessfulRemoteDataObject(paginatedList);
  const elementsPerPage = 3;
  const currentPage = 0;

  beforeEach(async () => {
   await TestBed.configureTestingModule({
      providers: [
        { provide: DeduplicationRestService, useClass: getMockDeduplicationRestService },
        { provide: DeduplicationSignaturesService, useValue: service }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    restService = TestBed.get(DeduplicationRestService);
    restServiceAsAny = restService;
    restServiceAsAny.getSignatures.and.returnValue(observableOf(paginatedListRD));
    service = new DeduplicationSignaturesService(restService);
    serviceAsAny = service;
  });

  describe('getSignatures', () => {
    const sortOptions = new SortOptions('signatureType', SortDirection.ASC);
    const findListOptions: FindListOptions = {
      elementsPerPage: elementsPerPage,
      currentPage: currentPage,
      sort: sortOptions
    };
    it('Should proxy the call to deduplicationRestService.getSignatures', () => {
      const result = service.getSignatures(findListOptions);
      expect((service as any).deduplicationRestService.getSignatures).toHaveBeenCalledWith(findListOptions);
    });

    it('Should return a paginated list of Signature objects', () => {
      const expected = cold('(a|)', {
        a: paginatedList
      });
      const result = service.getSignatures(findListOptions);
      expect(result).toBeObservable(expected);
    });
  });
});
