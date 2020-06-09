import { TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { cold } from 'jasmine-marbles';
import { deduplicationReducers } from './deduplication.reducer';
import { DeduplicationStateService } from './deduplication-state.service';
import { mockSignatureObjectTitle, mockSignatureObjectIdentifier, mockSignatureObjectOther } from '../shared/mocks/deduplication.mock';
import { RetrieveAllSignaturesAction } from './signatures/deduplication-signatures.actions';

describe('DeduplicationStateService', () => {
  let service: DeduplicationStateService;
  let serviceAsAny: any;
  let store: any;
  let initialState: any;

  function init(mode: string) {
    if (mode === 'empty') {
      initialState = {
        deduplication: {
          signatures: {
            objects: [],
            processing: false,
            loaded: false,
            totalPages: 0,
            currentPage: -1,
            totalElements: 0
          }
        }
      };
    } else {
      initialState = {
        deduplication: {
          signatures: {
            objects: [
              mockSignatureObjectTitle,
              mockSignatureObjectIdentifier,
              mockSignatureObjectOther
            ],
            processing: false,
            loaded: true,
            totalPages: 1,
            currentPage: 0,
            totalElements: 3
          }
        }
      };
    }
  }

  describe('Testing methods with empty signature objects', () => {
    beforeEach(async () => {
      init('empty');
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({ deduplication: deduplicationReducers } as any),
        ],
        providers: [
          provideMockStore({ initialState }),
          { provide: DeduplicationStateService, useValue: service }
        ]
      }).compileComponents();
    });

    beforeEach(() => {
      store = TestBed.get(Store);
      service = new DeduplicationStateService(store);
      serviceAsAny = service;
      spyOn(store, 'dispatch');
    });

    describe('getDeduplicationSignatures', () => {
      it('Should return an empty array', () => {
        const result = service.getDeduplicationSignatures();
        const expected = cold('(a)', {
          a: []
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('getDeduplicationSignaturesTotalPages', () => {
      it('Should return zero (0)', () => {
        const result = service.getDeduplicationSignaturesTotalPages();
        const expected = cold('(a)', {
          a: 0
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('getDeduplicationSignaturesCurrentPage', () => {
      it('Should return minus one (-1)', () => {
        const result = service.getDeduplicationSignaturesCurrentPage();
        const expected = cold('(a)', {
          a: -1
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('getDeduplicationSignaturesTotals', () => {
      it('Should return zero (0)', () => {
        const result = service.getDeduplicationSignaturesTotals();
        const expected = cold('(a)', {
          a: 0
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('isDeduplicationSignaturesLoading', () => {
      it('Should return TRUE', () => {
        const result = service.isDeduplicationSignaturesLoading();
        const expected = cold('(a)', {
          a: true
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('isDeduplicationSignaturesLoaded', () => {
      it('Should return FALSE', () => {
        const result = service.isDeduplicationSignaturesLoaded();
        const expected = cold('(a)', {
          a: false
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('isDeduplicationSignaturesProcessing', () => {
      it('Should return FALSE', () => {
        const result = service.isDeduplicationSignaturesProcessing();
        const expected = cold('(a)', {
          a: false
        });
        expect(result).toBeObservable(expected);
      });
    });
  });

  describe('Testing methods with signature objects', () => {
    beforeEach(async () => {
      init('full');
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({ deduplication: deduplicationReducers } as any),
        ],
        providers: [
          provideMockStore({ initialState }),
          { provide: DeduplicationStateService, useValue: service }
        ]
      }).compileComponents();
    });

    beforeEach(() => {
      store = TestBed.get(Store);
      service = new DeduplicationStateService(store);
      serviceAsAny = service;
      spyOn(store, 'dispatch');
    });

    describe('getDeduplicationSignatures', () => {
      it('Should return an array of signatures', () => {
        const result = service.getDeduplicationSignatures();
        const expected = cold('(a)', {
          a: [
            mockSignatureObjectTitle,
            mockSignatureObjectIdentifier,
            mockSignatureObjectOther
          ]
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('getDeduplicationSignaturesTotalPages', () => {
      it('Should return one (1)', () => {
        const result = service.getDeduplicationSignaturesTotalPages();
        const expected = cold('(a)', {
          a: 1
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('getDeduplicationSignaturesCurrentPage', () => {
      it('Should return minus zero (0)', () => {
        const result = service.getDeduplicationSignaturesCurrentPage();
        const expected = cold('(a)', {
          a: 0
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('getDeduplicationSignaturesTotals', () => {
      it('Should return three (3)', () => {
        const result = service.getDeduplicationSignaturesTotals();
        const expected = cold('(a)', {
          a: 3
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('isDeduplicationSignaturesLoading', () => {
      it('Should return FALSE', () => {
        const result = service.isDeduplicationSignaturesLoading();
        const expected = cold('(a)', {
          a: false
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('isDeduplicationSignaturesLoaded', () => {
      it('Should return TRUE', () => {
        const result = service.isDeduplicationSignaturesLoaded();
        const expected = cold('(a)', {
          a: true
        });
        expect(result).toBeObservable(expected);
      });
    });

    describe('isDeduplicationSignaturesProcessing', () => {
      it('Should return FALSE', () => {
        const result = service.isDeduplicationSignaturesProcessing();
        const expected = cold('(a)', {
          a: false
        });
        expect(result).toBeObservable(expected);
      });
    });
  });

  describe('Testing the signatures dispatch methods', () => {
    beforeEach(async () => {
      init('full');
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({ deduplication: deduplicationReducers } as any),
        ],
        providers: [
          provideMockStore({ initialState }),
          { provide: DeduplicationStateService, useValue: service }
        ]
      }).compileComponents();
    });

    beforeEach(() => {
      store = TestBed.get(Store);
      service = new DeduplicationStateService(store);
      serviceAsAny = service;
      spyOn(store, 'dispatch');
    });

    describe('dispatchRetrieveDeduplicationSignatures', () => {
      it('Should call store.dispatch', () => {
        const elementsPerPage = 3;
        const action = new RetrieveAllSignaturesAction(elementsPerPage)
        service.dispatchRetrieveDeduplicationSignatures(elementsPerPage);
        expect(serviceAsAny.store.dispatch).toHaveBeenCalledWith(action);
      });
    });
  })
});
