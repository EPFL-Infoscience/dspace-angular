import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitstreamAttachmentComponent } from './bitstream-attachment.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BitstreamDataService } from '../../../../../../../../core/data/bitstream-data.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { createSuccessfulRemoteDataObject$ } from '../../../../../../../../shared/remote-data.utils';
import { Bitstream } from '../../../../../../../../core/shared/bitstream.model';
import { TranslateLoaderMock } from '../../../../../../../../shared/mocks/translate-loader.mock';
import { FileSizePipe } from '../../../../../../../../shared/utils/file-size-pipe';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AdvancedAttachmentElementType } from '../../../../../../../../../config/advanced-attachment-rendering.config';
import { VocabularyService } from '../../../../../../../../core/submission/vocabularies/vocabulary.service';
import { PageInfo } from '../../../../../../../../core/shared/page-info.model';
import { buildPaginatedList } from '../../../../../../../../core/data/paginated-list.model';

describe('BitstreamAttachmentComponent', () => {
  let component: BitstreamAttachmentComponent;
  let fixture: ComponentFixture<BitstreamAttachmentComponent>;
  let mockVocabularyService: {
    getPublicVocabularyEntryByValue: jasmine.Spy;
  };
  const attachmentMock: any = Object.assign(new Bitstream(),
    {
      checkSum: {
        checkSumAlgorithm: 'MD5',
        value: 'checksum',
      },
      thumbnail: createSuccessfulRemoteDataObject$(new Bitstream())
    }
  );

  beforeEach(async () => {
    mockVocabularyService = {
      getPublicVocabularyEntryByValue: jasmine.createSpy('getPublicVocabularyEntryByValue').and.returnValue(
        createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [{ display: 'Display Value' } as any]))
      )
    };
     await TestBed.configureTestingModule({
       declarations: [ BitstreamAttachmentComponent, FileSizePipe ],
       imports: [
         NgbTooltipModule,
         RouterTestingModule.withRoutes([]),
         TranslateModule.forRoot({
           loader: {
             provide: TranslateLoader,
             useClass: TranslateLoaderMock
           }
         })
       ],
       providers: [
         {provide: 'fieldProvider', useValue: {}},
         {provide: 'itemProvider', useValue: {}},
         {provide: 'renderingSubTypeProvider', useValue: ''},
         {provide: 'tabNameProvider', useValue: '' },
         {provide: BitstreamDataService, useValue: {}},
         {provide: VocabularyService, useValue: mockVocabularyService}
       ],
       schemas: [ NO_ERRORS_SCHEMA ]
     })
     .compileComponents();
   });

  beforeEach(() => {
    fixture = TestBed.createComponent(BitstreamAttachmentComponent);
    component = fixture.componentInstance;
    component.attachment = attachmentMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate metadataVocabularyValues using vocabulary display on ngOnInit', () => {
    component.attachment = {
      firstMetadataValue: () => 'test-code',
      allMetadataValues: () => [],
      thumbnail: createSuccessfulRemoteDataObject$(new Bitstream())
    } as any;
    component.envMetadata = [{
      name: 'dc.title',
      type: AdvancedAttachmentElementType.Metadata,
      vocabularyName: 'testVocab'
    } as any];

    component.ngOnInit();

    expect(component.metadataVocabularyValues.testVocab).toBeDefined();
    expect(component.metadataVocabularyValues.testVocab['test-code']).toBe('Display Value');
  });

  it('getVocabularyValue should fallback to raw metadata value when vocabulary returns empty', (done) => {
    mockVocabularyService.getPublicVocabularyEntryByValue.and.returnValue(
      createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), []))
    );

    const mockAttachment = { firstMetadataValue: () => 'raw-value' } as any;
    component.getVocabularyValue(mockAttachment, 'dc.title', 'testVocab').subscribe((value) => {
      expect(value).toBe('raw-value');
      done();
    });
  });

});
