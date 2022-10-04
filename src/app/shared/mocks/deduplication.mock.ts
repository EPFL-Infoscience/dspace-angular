import { SignatureObject } from '../../core/deduplication/models/signature.model';
import { ResourceType } from '../../core/shared/resource-type';
import { DeduplicationStateService } from '../../deduplication/deduplication-state.service';
import { DeduplicationRestService } from '../../core/deduplication/services/deduplication-rest.service';
import { SetObject } from '../../core/deduplication/models/set.model';

// REST Mock ---------------------------------------------------------------------
// -------------------------------------------------------------------------------

export const mockSignatureObjectTitle: SignatureObject = {
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

export const mockSignatureObjectIdentifier: SignatureObject = {
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

export const mockSignatureObjectOther: SignatureObject = {
  type: new ResourceType('signature'),
  id: 'other',
  signatureType: 'other',
  groupReviewerCheck: 35,
  groupSubmitterCheck: 9,
  groupAdminstratorCheck: 16,
  _links: {
    self: {
      href: 'http://rest.api/rest/api/deduplications/signatures/identifier'
    }
  }
};

/**
 * Mock for [[DeduplicationStateService]]
 */
export function getMockDeduplicationStateService():
  DeduplicationStateService {
  return jasmine.createSpyObj('DeduplicationStateService', {
    getDeduplicationSignatures: jasmine.createSpy('getDeduplicationSignatures'),
    isDeduplicationSignaturesLoading: jasmine.createSpy('isDeduplicationSignaturesLoading'),
    isDeduplicationSignaturesLoaded: jasmine.createSpy('isDeduplicationSignaturesLoaded'),
    isDeduplicationSignaturesProcessing: jasmine.createSpy('isDeduplicationSignaturesProcessing'),
    getDeduplicationSignaturesTotalPages: jasmine.createSpy('getDeduplicationSignaturesTotalPages'),
    getDeduplicationSignaturesCurrentPage: jasmine.createSpy('getDeduplicationSignaturesCurrentPage'),
    getDeduplicationSignaturesTotals: jasmine.createSpy('getDeduplicationSignaturesTotals'),
    dispatchRetrieveDeduplicationSignatures: jasmine.createSpy('dispatchRetrieveDeduplicationSignatures'),

    getDeduplicationSetsPerSignature: jasmine.createSpy('getDeduplicationSetsPerSignature'),
    getDeduplicationSetsTotalPages: jasmine.createSpy('getDeduplicationSetsTotalPages'),
    getDeduplicationSetsCurrentPage: jasmine.createSpy('getDeduplicationSetsCurrentPage'),
    getDeduplicationSetsTotals: jasmine.createSpy('getDeduplicationSetsTotals'),
    isDeduplicationSetsLoaded: jasmine.createSpy('isDeduplicationSetsLoaded'),
    isDeduplicationSetsLoading: jasmine.createSpy('isDeduplicationSetsLoading'),
    dispatchRetrieveDeduplicationSetsBySignature: jasmine.createSpy('dispatchRetrieveDeduplicationSetsBySignature'),
    isDeduplicationSetsProcessing: jasmine.createSpy('isDeduplicationSetsProcessing'),
    dispatchDeleteSet: jasmine.createSpy('dispatchDeleteSet'),
    dispatchRemoveItem: jasmine.createSpy('dispatchRemoveItem'),
    dispatchRetrieveDeduplicationSetItems: jasmine.createSpy('dispatchRetrieveDeduplicationSetItems'),
    getDeduplicationSetItems: jasmine.createSpy('getDeduplicationSetItems'),
  });
}

/**
 * Mock for [[DeduplicationRestService]]
 */
export function getMockDeduplicationRestService():
  DeduplicationRestService {
  return jasmine.createSpyObj('DeduplicationRestService', {
    getSignatures: jasmine.createSpy('getSignatures'),
    getSignature: jasmine.createSpy('getSignature'),
  });
}

export const mockSetObject: SetObject = {
  type: new ResourceType('set'),
  id: 'title:d4b9185f91391c0574f4c3dbdd6fa7d3',
  signatureId: 'title',
  setChecksum: 'd4b9185f91391c0574f4c3dbdd6fa7d3',
  otherSetIds: [],
  _links: {
    self: {
      href: 'http://rest.api/rest/api/deduplications/sets/title:d4b9185f91391c0574f4c3dbdd6fa7d3'
    }
  }
};
