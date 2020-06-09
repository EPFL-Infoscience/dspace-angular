import { SignatureObject } from '../../core/deduplication/models/signature.model';
import { ResourceType } from '../../core/shared/resource-type';
import { DeduplicationStateService } from '../../deduplication/deduplication-state.service';
import { DeduplicationRestService } from '../../core/deduplication/deduplication-rest.service';

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
