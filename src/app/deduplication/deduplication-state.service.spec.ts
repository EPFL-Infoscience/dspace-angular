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
      await TestBed.configureTestingModule({
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
  });

  describe('Testing methods with signature objects', () => {
    beforeEach(async () => {
      init('full');
      await TestBed.configureTestingModule({
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
  });

  describe('Testing the signatures dispatch methods', () => {
    beforeEach(async () => {
      init('full');
      await TestBed.configureTestingModule({
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
        const action = new RetrieveAllSignaturesAction();
        service.dispatchRetrieveDeduplicationSignatures();
        expect(serviceAsAny.store.dispatch).toHaveBeenCalledWith(action);
      });
    });
  });
});
