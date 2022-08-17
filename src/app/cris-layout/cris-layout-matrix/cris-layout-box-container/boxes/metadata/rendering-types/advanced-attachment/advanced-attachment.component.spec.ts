import { Type } from './../../../../../../../../config/advanced-attachment.config';
import { BitstreamFormat } from './../../../../../../../core/shared/bitstream-format.model';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdvancedAttachmentComponent } from './advanced-attachment.component';
import { SharedModule } from '../../../../../../../shared/shared.module';
import { Item } from '../../../../../../../core/shared/item.model';
import { Observable, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BitstreamDataService } from '../../../../../../../core/data/bitstream-data.service';
import { RemoteData } from '../../../../../../../core/data/remote-data';
import { Bitstream } from '../../../../../../../core/shared/bitstream.model';
import { createSuccessfulRemoteDataObject$ } from '../../../../../../../shared/remote-data.utils';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../../../../../shared/mocks/translate-loader.mock';
import { createPaginatedList } from '../../../../../../../shared/testing/utils.test';
import { By } from '@angular/platform-browser';
import { AuthorizationDataService } from '../../../../../../../core/data/feature-authorization/authorization-data.service';
import { RouterTestingModule } from '@angular/router/testing';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { FieldRenderingType } from '../metadata-box.decorator';
import { StoreModule } from '@ngrx/store';

describe('AdvancedAttachmentComponent', () => {
  let component: AdvancedAttachmentComponent;
  let fixture: ComponentFixture<AdvancedAttachmentComponent>;

  let spyDownload;
  let spyRequestACopy;

  const testItem = Object.assign(new Item(), {
    bundles: of({}),
    metadata: {
      'dc.identifier.doi': [
        {
          value: 'doi:10.1392/dironix'
        }
      ]
    },
    _links: {
      self: { href: 'obj-selflink' }
    },
    uuid: 'item-uuid',
  });

  const mockField: LayoutField = {
    metadata: '',
    label: 'Files',
    rendering: FieldRenderingType.ADVANCEDATTACHMENT,
    fieldType: 'BITSTREAM',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true,
    bitstream: {
      bundle: 'ORIGINAL',
      metadataField: 'dc.type',
      metadataValue: 'attachment'
    }
  };

  const bitstream1 = Object.assign(new Bitstream(), {
    id: 'bitstream4',
    uuid: 'bitstream4',
    description: 'test-description',
    metadata: {
      'dc.title': [
        {
          value: 'test-title',
          language: null,
          authority: null,
          confidence: -1,
          place: -1
        } as any
      ],
      'dc.type': [
        {
          value: 'test-type',
          language: null,
          authority: null,
          confidence: -1,
          place: -1
        } as any
      ],
      'dc.description': [
        {
          value: 'test-description',
          language: null,
          authority: null,
          confidence: -1,
          place: -1
        } as any
      ],
    },
    thumbnail: createSuccessfulRemoteDataObject$(Object.assign(new Bitstream(), {
      id: 'thumbnail1',
      uuid: 'thumbnail1',
      sizeBytes: 7798,
      _links: {
        'content': {
          'href': 'http://localhost:8080/server/api/core/bitstreams/thumbnail-6df9-40ef-9009-b3c90a4e6d5b/content'
        },
        'bundle': {
          'href': 'http://localhost:8080/server/api/core/bitstreams/thumbnail-6df9-40ef-9009-b3c90a4e6d5b/bundle'
        },
        'format': {
          'href': 'http://localhost:8080/server/api/core/bitstreams/thumbnail-6df9-40ef-9009-b3c90a4e6d5b/format'
        },
        'thumbnail': {
          'href': 'http://localhost:8080/server/api/core/bitstreams/thumbnail-6df9-40ef-9009-b3c90a4e6d5b/thumbnail'
        },
        'self': {
          'href': 'http://localhost:8080/server/api/core/bitstreams/thumbnail-6df9-40ef-9009-b3c90a4e6d5b'
        }
      }
    })),
    format: createSuccessfulRemoteDataObject$(Object.assign(new BitstreamFormat(), {
      id: 'format',
      uuid: 'format',
      shortDescription: 'PDF',
      _links: {
        'self': {
          'href': 'http://localhost:8080/server/api/core/bitstreams/thumbnail-6df9-40ef-9009-b3c90a4e6d5b'
        }
      }
    })),
    _links: {
      self: { href: 'obj-selflink' }
    }
  });

  const bitstream2 = Object.assign(new Bitstream(), {
    id: 'bitstream4',
    uuid: 'bitstream4',
    thumbnail: createSuccessfulRemoteDataObject$(null),
    _links: {
      self: { href: 'obj-selflink' }
    }
  });

  const mockBitstreamDataService = jasmine.createSpyObj('BitstreamDataService', {
    getThumbnailFor(item: Item): Observable<RemoteData<Bitstream>> {
      return createSuccessfulRemoteDataObject$(new Bitstream());
    },
    findAllByItemAndBundleName: jasmine.createSpy('findAllByItemAndBundleName')
  });

  const mockAuthorizedService = jasmine.createSpyObj('AuthorizationDataService', {
    isAuthorized: jasmine.createSpy('isAuthorized')
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      }),
        RouterTestingModule,
        SharedModule,
      StoreModule.forRoot({}),
      ],
      declarations: [AdvancedAttachmentComponent],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: BitstreamDataService, useValue: mockBitstreamDataService },
        { provide: AuthorizationDataService, useValue: mockAuthorizedService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedAttachmentComponent);
    component = fixture.componentInstance;
    mockBitstreamDataService.findAllByItemAndBundleName.and.returnValues(createSuccessfulRemoteDataObject$(createPaginatedList([bitstream1])));
    component.item = testItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show thumbnail', () => {
    expect(fixture.debugElement.query(By.css('ds-thumbnail'))).toBeTruthy();
  });

  describe('When envoirment configuration are all true', () => {

    beforeEach(() => {
      component.envData = [
        {
          name: 'dc.title',
          type: Type.Metadata,
          truncatable: false
        },
        {
          name: 'dc.type',
          type: Type.Metadata,
          truncatable: false
        },
        {
          name: 'dc.description',
          type: Type.Metadata,
          truncatable: true
        },
        {
          name: 'size',
          type: Type.Attribute,
        },
        {
          name: 'format',
          type: Type.Attribute,
        }
      ];
      fixture.detectChanges();
    });

    it('should show title', () => {
      expect(fixture.debugElement.query(By.css('[data-test="dc.title"]'))).toBeTruthy();
    });

    it('should show description', () => {
      expect(fixture.debugElement.query(By.css('[data-test="dc.description"]'))).toBeTruthy();
    });

    it('should show type', () => {
      expect(fixture.debugElement.query(By.css('[data-test="dc.type"]'))).toBeTruthy();
    });

    it('should show format', () => {
      expect(fixture.debugElement.query(By.css('[data-test="format"]'))).toBeTruthy();
    });

    it('should show size', () => {
      expect(fixture.debugElement.query(By.css('[data-test="size"]'))).toBeTruthy();
    });
  });

  describe('When envoirment configuration are all false', () => {

    beforeEach(() => {
      component.envData = [];
      fixture.detectChanges();
    });

    it('should show title', () => {
      expect(fixture.debugElement.query(By.css('[data-test="dc.title"]'))).toBeFalsy();
    });

    it('should show description', () => {
      expect(fixture.debugElement.query(By.css('[data-test="dc.description"]'))).toBeFalsy();
    });

    it('should show type', () => {
      expect(fixture.debugElement.query(By.css('[data-test="dc.type"]'))).toBeFalsy();
    });

    it('should show format', () => {
      expect(fixture.debugElement.query(By.css('[data-test="format"]'))).toBeFalsy();
    });

    it('should show size', () => {
      expect(fixture.debugElement.query(By.css('[data-test="size"]'))).toBeFalsy();
    });
  });


});
