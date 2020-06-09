import { RetrieveAllSignaturesAction,
  RetrieveAllSignaturesErrorAction,
  AddSignaturesAction
} from './deduplication-signatures.actions';
import {
  deduplicationSignatureReducer,
  DeduplicationSignatureState
} from './deduplication-signatures.reducer';
import {
  mockSignatureObjectIdentifier,
  mockSignatureObjectTitle
} from '../../shared/mocks/deduplication.mock';

describe('deduplicationSignatureReducer test suite', () => {
  let deduplicationSignatureInitialState: DeduplicationSignatureState;
  const elementPerPage = 3;

  beforeEach(() => {
    deduplicationSignatureInitialState = {
      objects: [],
      processing: false,
      loaded: false,
      totalPages: 0,
      currentPage: -1,
      totalElements: 0
    };
  });

  it('Action RETRIEVE_ALL_SIGNATURES should set the State property "processing" to TRUE', () => {
    const expectedState = deduplicationSignatureInitialState;
    expectedState.processing = true;

    const action = new RetrieveAllSignaturesAction(elementPerPage);
    const newState = deduplicationSignatureReducer(deduplicationSignatureInitialState, action);

    expect(newState).toEqual(expectedState);
  });

  it('Action RETRIEVE_ALL_SIGNATURES_ERROR should change the State to initial State but processing, loaded, and currentPage', () => {
    const expectedState = deduplicationSignatureInitialState;
    expectedState.processing = false;
    expectedState.loaded = true;
    expectedState.currentPage = 0;

    const action = new RetrieveAllSignaturesErrorAction();
    const newState = deduplicationSignatureReducer(deduplicationSignatureInitialState, action);

    expect(newState).toEqual(expectedState);
  });

  it('Action ADD_SIGNATURES should populate the State with Deduplication signatures', () => {
    const expectedState = {
      objects: [ mockSignatureObjectTitle, mockSignatureObjectIdentifier ],
      processing: false,
      loaded: true,
      totalPages: 1,
      currentPage: 0,
      totalElements: 2
    }

    const action = new AddSignaturesAction(
      [ mockSignatureObjectTitle, mockSignatureObjectIdentifier ],
      1, 0, 2
    );
    const newState = deduplicationSignatureReducer(deduplicationSignatureInitialState, action);

    expect(newState).toEqual(expectedState);
  });
});
