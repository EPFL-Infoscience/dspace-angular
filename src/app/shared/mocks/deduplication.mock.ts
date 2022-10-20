import { Item } from './../../core/shared/item.model';
import { MetadataMap } from 'src/app/core/shared/metadata.models';

import { SubmissionRepeatableFieldsObject } from './../../core/deduplication/models/submission-repeatable-fields.model';
import { SignatureObject } from '../../core/deduplication/models/signature.model';
import { ResourceType } from '../../core/shared/resource-type';
import { DeduplicationStateService } from '../../deduplication/deduplication-state.service';
import { DeduplicationRestService } from '../../core/deduplication/services/deduplication-rest.service';
import { SetObject } from '../../core/deduplication/models/set.model';
import { ItemData } from 'src/app/deduplication/interfaces/deduplication-merge.models';

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
      href: 'http://rest.api/rest/api/deduplications/signatures/title',
    },
  },
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
      href: 'http://rest.api/rest/api/deduplications/signatures/identifier',
    },
  },
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
      href: 'http://rest.api/rest/api/deduplications/signatures/identifier',
    },
  },
};

/**
 * Mock for [[DeduplicationStateService]]
 */
export function getMockDeduplicationStateService(): DeduplicationStateService {
  return jasmine.createSpyObj('DeduplicationStateService', {
    getDeduplicationSignatures: jasmine.createSpy('getDeduplicationSignatures'),
    isDeduplicationSignaturesLoading: jasmine.createSpy(
      'isDeduplicationSignaturesLoading'
    ),
    isDeduplicationSignaturesLoaded: jasmine.createSpy(
      'isDeduplicationSignaturesLoaded'
    ),
    isDeduplicationSignaturesProcessing: jasmine.createSpy(
      'isDeduplicationSignaturesProcessing'
    ),
    getDeduplicationSignaturesTotalPages: jasmine.createSpy(
      'getDeduplicationSignaturesTotalPages'
    ),
    getDeduplicationSignaturesCurrentPage: jasmine.createSpy(
      'getDeduplicationSignaturesCurrentPage'
    ),
    getDeduplicationSignaturesTotals: jasmine.createSpy(
      'getDeduplicationSignaturesTotals'
    ),
    dispatchRetrieveDeduplicationSignatures: jasmine.createSpy(
      'dispatchRetrieveDeduplicationSignatures'
    ),

    getDeduplicationSetsPerSignature: jasmine.createSpy(
      'getDeduplicationSetsPerSignature'
    ),
    getDeduplicationSetsTotalPages: jasmine.createSpy(
      'getDeduplicationSetsTotalPages'
    ),
    getDeduplicationSetsCurrentPage: jasmine.createSpy(
      'getDeduplicationSetsCurrentPage'
    ),
    getDeduplicationSetsTotals: jasmine.createSpy('getDeduplicationSetsTotals'),
    isDeduplicationSetsLoaded: jasmine.createSpy('isDeduplicationSetsLoaded'),
    isDeduplicationSetsLoading: jasmine.createSpy('isDeduplicationSetsLoading'),
    dispatchRetrieveDeduplicationSetsBySignature: jasmine.createSpy(
      'dispatchRetrieveDeduplicationSetsBySignature'
    ),
    isDeduplicationSetsProcessing: jasmine.createSpy(
      'isDeduplicationSetsProcessing'
    ),
    dispatchDeleteSet: jasmine.createSpy('dispatchDeleteSet'),
    dispatchRemoveItem: jasmine.createSpy('dispatchRemoveItem'),
    dispatchRetrieveDeduplicationSetItems: jasmine.createSpy(
      'dispatchRetrieveDeduplicationSetItems'
    ),
    getDeduplicationSetItems: jasmine.createSpy('getDeduplicationSetItems'),
  });
}

/**
 * Mock for [[DeduplicationRestService]]
 */
export function getMockDeduplicationRestService(): DeduplicationRestService {
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
      href: 'http://rest.api/rest/api/deduplications/sets/title:d4b9185f91391c0574f4c3dbdd6fa7d3',
    },
  },
};

export const mockSubmissionRepeatableFieldsObject: SubmissionRepeatableFieldsObject = {
  type: new ResourceType('submissionrepeatablefield'),
  itemId: '231d6608-0847-4f4b-ac5f-c6058ce6a73d',
  repeatableFields: ['dc.date.available', 'dc.date.accessioned'],
  _links: {
    self: {
      href: 'http://rest.api/config/submissionrepeatablefields/search/findByItem?uuid=231d6608-0847-4f4b-ac5f-c6058ce6a73d',
    },
  },
};

export const itemsToCompare: ItemData[] = [
  {
    object: Object.assign(new Item(), {
      handle: '123456789/1523',
      type: new ResourceType('item'),
      isArchived: true,
      isDiscoverable: true,
      isWithdrawn: false,
      entityType: 'Publication',
      _links: {
        bundles: {
          href: 'http://localhost:8080/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d/bundles',
        },
        mappedCollections: {
          href: 'http://localhost:8080/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d/mappedCollections',
        },
        owningCollection: {
          href: 'http://localhost:8080/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d/owningCollection',
        },
        self: {
          href: 'http://localhost:8080/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d',
        },
        relationships: {
          href: 'http://localhost:8080/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d/relationships',
        },
        version: {
          href: 'http://localhost:8080/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d/version',
        },
        templateItemOf: {
          href: 'http://localhost:8080/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d/templateItemOf',
        },
        metrics: {
          href: 'http://localhost:8080/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d/metrics',
        },
        thumbnail: {
          href: 'http://localhost:8080/server/api/core/items/231d6608-0847-4f4b-ac5f-c6058ce6a73d/thumbnail',
        },
      },
      id: '231d6608-0847-4f4b-ac5f-c6058ce6a73d',
      uuid: '231d6608-0847-4f4b-ac5f-c6058ce6a73d',
      metadata: Object.assign(new MetadataMap(), {
        'cris.virtual.department': [
          {
            uuid: 'ac0d1d69-f5c9-4ec6-8152-4261efa3d529',
            value: '4Science',
            place: 0,
          },
        ],
        'dc.contributor.author': [
          {
            uuid: '26ad8085-a693-48f7-8bc9-4c04457cdb78',
            value: 'Bollini, Andrea',
            place: 0,
          },
          {
            uuid: '0c2cd3f4-b3fc-4f77-abe7-218fca8924e6',
            language: null,
            value: 'Was Da',
            place: 1,
            authority: 'will be referenced::ORCID::0000-0002-6743-1580',
            confidence: -1,
          },
        ],
        'dc.date.accessioned': [
          {
            uuid: 'b3cf1d3b-96fb-4268-8be0-c45857012a31',
            value: '2022-10-03T10:05:45Z',
            place: 0,
          },
        ],
        'dc.date.available': [
          {
            uuid: 'b122fd3a-454a-4b6c-bcb5-0badba133870',
            value: '2022-10-03T10:05:45Z',
            place: 0,
          },
        ],
        'dc.date.issued': [
          {
            uuid: 'f2466484-9358-40e8-93e1-a4edac615af2',
            value: '2024',
            place: 0,
          },
        ],
        'dc.description.provenance': [
          {
            uuid: 'bacae485-0341-45dd-90fe-29a855f72d1c',
            language: 'en',
            value:
              'Submitted by Demo Site Administrator (dspacedemo+admin@gmail.com) on 2022-10-03T10:05:45Z workflow start=Step: checkcorrectionstep - action:noUserSelectionAction\nNo. of bitstreams: 1\nScreenshot_3.png: 105379 bytes, checksum: ae9d2ecc9ba6381530297ca56bffc7d8 (MD5)',
            place: 0,
          },
          {
            uuid: 'bae7c952-a4a5-4765-ac95-8519b7478e04',
            language: 'en',
            value:
              'Made available in DSpace on 2022-10-03T10:05:45Z (GMT). No. of bitstreams: 1\nScreenshot_3.png: 105379 bytes, checksum: ae9d2ecc9ba6381530297ca56bffc7d8 (MD5)\n  Previous issue date: 2024',
            place: 1,
          },
        ],
        'dc.identifier.uri': [
          {
            uuid: '9e805ddc-a10e-42e2-9c18-54558c4ba5e7',
            value: 'http://localhost:4000/handle/123456789/1523',
            place: 0,
          },
        ],
        'dc.title': [
          {
            uuid: 'cdd795bd-5edf-433c-be8a-ff9409f32d46',
            value:
              'An exquisitely preserved in-ovo theropod dinosaur embryo sheds light on avian-like prehatching postures',
            place: 0,
          },
        ],
        'dc.type': [
          {
            uuid: '2f94d35c-3def-4102-b96d-5508e511c944',
            language: null,
            value: 'Resource Types::text::blog post',
            place: 0,
            authority: 'publication-coar-types:c_6947',
          },
        ],
        'dspace.entity.type': [
          {
            uuid: '4700e18e-19af-4be2-afff-ba7869ef387f',
            value: 'Publication',
            place: 0,
          },
        ],
        'oairecerif.author.affiliation': [
          {
            uuid: '78590bce-6873-4f0d-8aad-35ec7ba7c8f0',
            value: '4Science',
            place: 0,
            authority: 'a14ba215-c0f0-4b74-b21a-06359bfabd45',
          },
          {
            uuid: '1ebf0830-32c5-4e0c-b7ac-66c9425b6d69',
            value: '#PLACEHOLDER_PARENT_METADATA_VALUE#',
            place: 1,
          },
        ],
      }),
    }),
    color: '#D09000',
  },
  {
    object: Object.assign(new Item(), {
      handle: '123456789/1524',
      isArchived: true,
      isDiscoverable: true,
      isWithdrawn: false,
      entityType: 'Publication',
      _links: {
        bundles: {
          href: 'http://localhost:8080/server/api/core/items/2c6a5994-ffd5-44c3-941c-baca3afcc9b0/bundles',
        },
        mappedCollections: {
          href: 'http://localhost:8080/server/api/core/items/2c6a5994-ffd5-44c3-941c-baca3afcc9b0/mappedCollections',
        },
        owningCollection: {
          href: 'http://localhost:8080/server/api/core/items/2c6a5994-ffd5-44c3-941c-baca3afcc9b0/owningCollection',
        },
        relationships: {
          href: 'http://localhost:8080/server/api/core/items/2c6a5994-ffd5-44c3-941c-baca3afcc9b0/relationships',
        },
        version: {
          href: 'http://localhost:8080/server/api/core/items/2c6a5994-ffd5-44c3-941c-baca3afcc9b0/version',
        },
        templateItemOf: {
          href: 'http://localhost:8080/server/api/core/items/2c6a5994-ffd5-44c3-941c-baca3afcc9b0/templateItemOf',
        },
        metrics: {
          href: 'http://localhost:8080/server/api/core/items/2c6a5994-ffd5-44c3-941c-baca3afcc9b0/metrics',
        },
        thumbnail: {
          href: 'http://localhost:8080/server/api/core/items/2c6a5994-ffd5-44c3-941c-baca3afcc9b0/thumbnail',
        },
        self: {
          href: 'http://localhost:8080/server/api/core/items/2c6a5994-ffd5-44c3-941c-baca3afcc9b0',
        },
      },
      name: 'An exquisitely preserved in-ovo theropod dinosaur embryo sheds light on avian-like prehatching postures',
      id: '2c6a5994-ffd5-44c3-941c-baca3afcc9b0',
      uuid: '2c6a5994-ffd5-44c3-941c-baca3afcc9b0',
      metadata: Object.assign(new MetadataMap(), {
        'dc.contributor.author': [
          {
            uuid: '593e4c41-02b3-4db0-80bd-5fc01feb69be',
            language: null,
            value: 'Sad Loudmouth',
            place: 0,
            authority: 'will be referenced::ORCID::0000-0002-7587-7785',
            confidence: -1,
          },
        ],
        'dc.date.accessioned': [
          {
            uuid: '7a63d78c-d6cc-4d3d-82cc-d9bbde935d47',
            value: '2022-10-03T10:06:45Z',
            place: 0,
          },
        ],
        'dc.date.available': [
          {
            uuid: '8db5b839-df73-4615-9de8-95807c31b0cd',
            language: null,
            value: '2022-10-03T10:06:45Z',
            place: 0,
            authority: null,
            confidence: -1,
          },
        ],
        'dc.date.issued': [
          {
            uuid: '4c4c650a-2103-4c26-b5fe-43e3028be50b',
            language: null,
            value: '2022',
            place: 0,
            authority: null,
            confidence: -1,
          },
        ],
        'dc.description.provenance': [
          {
            uuid: 'e7714f5b-406f-4815-85be-016a73f53ad0',
            language: 'en',
            value:
              'Submitted by Demo Site Administrator (dspacedemo+admin@gmail.com) on 2022-10-03T10:06:45Z workflow start=Step: checkcorrectionstep - action:noUserSelectionAction\nNo. of bitstreams: 1\nScreenshot_4.png: 205577 bytes, checksum: 6d0de4e75c5e344cc621a03ae92fb143 (MD5)',
            place: 0,
            authority: null,
            confidence: -1,
          },
          {
            uuid: '9cf7ed43-1415-49ee-83d8-d9b232c230f9',
            language: 'en',
            value:
              'Made available in DSpace on 2022-10-03T10:06:45Z (GMT). No. of bitstreams: 1\nScreenshot_4.png: 205577 bytes, checksum: 6d0de4e75c5e344cc621a03ae92fb143 (MD5)\n  Previous issue date: 2022',
            place: 1,
            authority: null,
            confidence: -1,
          },
        ],
        'dc.identifier.uri': [
          {
            uuid: 'ea4b2957-c260-42e1-bc01-da95ebc4caf0',
            language: null,
            value: 'http://localhost:4000/handle/123456789/1524',
            place: 0,
            authority: null,
            confidence: -1,
          },
        ],
        'dc.title': [
          {
            uuid: '7d73a8a5-ee45-42a8-a603-515cd34d25dd',
            language: null,
            value:
              'An exquisitely preserved in-ovo theropod dinosaur embryo sheds light on avian-like prehatching postures',
            place: 0,
            authority: null,
            confidence: -1,
            securityLevel: 0,
          },
        ],
        'dc.type': [
          {
            uuid: 'b171f124-ecbf-4abe-a118-4e0d1b1957a6',
            language: null,
            value: 'Resource Types::text::lecture',
            place: 0,
            authority: 'publication-coar-types:c_8544',
            confidence: 600,
            securityLevel: 0,
          },
        ],
        'dspace.entity.type': [
          {
            uuid: 'c3524423-b07a-475b-97d2-93397dff74dd',
            language: null,
            value: 'Publication',
            place: 0,
            authority: null,
            confidence: -1,
          },
        ],
        'oairecerif.author.affiliation': [
          {
            uuid: '9643ef0c-4e9f-415e-a75a-c9c06f1fcb3a',
            language: null,
            value: '#PLACEHOLDER_PARENT_METADATA_VALUE#',
            place: 0,
            authority: null,
            confidence: -1,
          },
        ],
      }),
    }),
    color: '#40A0A6',
  },
];
