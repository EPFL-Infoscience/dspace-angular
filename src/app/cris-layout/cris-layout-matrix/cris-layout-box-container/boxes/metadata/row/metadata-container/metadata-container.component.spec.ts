import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataContainerComponent } from './metadata-container.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../../../../../shared/mocks/translate-loader.mock';
import { Item } from '../../../../../../../core/shared/item.model';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { boxMetadata } from '../../../../../../../shared/testing/box.mock';
import { By } from '@angular/platform-browser';
import { FieldRenderingType } from '../../rendering-types/metadata-box.decorator';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { BitstreamDataService } from '../../../../../../../core/data/bitstream-data.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../../../shared/remote-data.utils';
import { createPaginatedList } from '../../../../../../../shared/testing/utils.test';
import { Bitstream } from '../../../../../../../core/shared/bitstream.model';
import { LoadMoreService } from 'src/app/cris-layout/services/load-more.service';
import { NestedMetadataGroupEntry } from '../../rendering-types/metadataGroup/metadata-group.component';

interface ComputedData {
  firstLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>;
  lastLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>;
  isConfigured: boolean;
  firstLimit: number;
  lastLimit: number;
}

fdescribe('MetadataContainerComponent', () => {
  let component: MetadataContainerComponent;
  let fixture: ComponentFixture<MetadataContainerComponent>;

  const metadataValue = Object.assign(new MetadataValue(), {
    'value': 'test item title',
    'language': null,
    'authority': null,
    'confidence': -1,
    'place': 0
  });

  const testItem = Object.assign(new Item(),
    {
      type: 'item',
      metadata: {
        'dc.title': [metadataValue],
        'dc.contributor.author': [
          {
            value: 'Donohue, Tim'
          },
          {
            value: 'Surname, Name'
          }
        ],
        'oairecerif.author.affiliation': [
          {
            value: 'Duraspace'
          },
          {
            value: '4Science'
          }
        ]
      },
      uuid: 'test-item-uuid',
    }
  );

  const fieldMock = {
    metadata: 'dc.title',
    label: 'Preferred name',
    rendering: null,
    fieldType: 'METADATA',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true
  };

  const fieldMock1 = {
    metadata: 'dc.title',
    label: 'Preferred name',
    rendering: 'inline.more.1.last.2',
    fieldType: 'METADATA',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true
  };

  const fieldMockWithoutLabel = {
    metadata: 'dc.title',
    label: null,
    rendering: null,
    fieldType: 'METADATA',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true
  };

  const fieldMockWithoutMetadata = {
    metadata: 'dc.identifier',
    label: 'Preferred name',
    rendering: null,
    fieldType: 'METADATA',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true
  };

  const fieldStructuredMock = Object.assign({
    id: 1,
    metadata: 'dc.contributor.author',
    fieldType: 'METADATAGROUP',
    label: 'Author(s)',
    rendering: FieldRenderingType.TABLE,
    style: 'container row',
    styleLabel: 'test-group-style-label',
    styleValue: 'test-group-style-value',
    metadataGroup: {
      leading: 'dc.contributor.author',
      elements: [
        {
          metadata: 'dc.contributor.author',
          label: 'Author(s)',
          rendering: 'TEXT',
          fieldType: 'METADATA',
          style: null,
          styleLabel: 'test-style-label',
          styleValue: 'test-style-value',
        },
        {
          metadata: 'oairecerif.author.affiliation',
          label: 'Affiliation(s)',
          rendering: 'TEXT',
          fieldType: 'METADATA',
          style: null,
          styleLabel: 'font-weight-bold col-0',
          styleValue: 'col'
        }
      ]
    }
  }) as LayoutField;

  const bitstreamField = Object.assign({
    id: 1,
    label: 'Field Label',
    metadata: 'dc.identifier.doi',
    rendering: FieldRenderingType.ATTACHMENT,
    fieldType: 'BITSTREAM',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    bitstream: {
      bundle: 'ORIGINAL',
      metadataField: 'dc.type',
      metadataValue: 'thumbnail'
    }
  });

  const bitstream1 = Object.assign(new Bitstream(), {
    id: 'bitstream1',
    uuid: 'bitstream1'
  });

  const mockBitstreamDataService = jasmine.createSpyObj('BitstreamDataService', {
    findAllByItemAndBundleName: jasmine.createSpy('findAllByItemAndBundleName')
  });

  const mockLoadMoreService = jasmine.createSpyObj('LoadMoreService',{
    getComputedData: jasmine.createSpy('getComputedData')
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      providers: [
        { provide: BitstreamDataService, useValue: mockBitstreamDataService },
        { provide: LoadMoreService, useValue: mockLoadMoreService },
      ],
      declarations: [MetadataContainerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataContainerComponent);
    component = fixture.componentInstance;
    component.item = testItem;
    component.box = boxMetadata;
    mockBitstreamDataService.findAllByItemAndBundleName.and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([])));
  });

  describe('When field rendering type is not structured', () => {

    beforeEach(() => {
      component.field = fieldMock;
      fixture.detectChanges();
    });
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render metadata properly', (done) => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
      expect(spanValueFound.length).toBe(1);

      const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
      expect(valueFound.length).toBe(1);
      done();
    });
  });

  describe('When field rendering type is structured', () => {

    beforeEach(() => {
      component.field = fieldStructuredMock;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render metadata properly', (done) => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-group-style-label'));
      expect(spanValueFound.length).toBe(1);

      const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
      expect(valueFound.length).toBe(1);
      done();
    });
  });

  describe('When field has no label', () => {

    beforeEach(() => {
      component.field = fieldMockWithoutLabel;
      fixture.detectChanges();
    });
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render metadata properly', (done) => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
      expect(spanValueFound.length).toBe(0);

      const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
      expect(valueFound.length).toBe(1);
      done();
    });
  });

  describe('When item has not the field metadata', () => {

    beforeEach(() => {
      component.field = fieldMockWithoutMetadata;
      fixture.detectChanges();
    });
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render metadata properly', (done) => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
      expect(spanValueFound.length).toBe(0);

      const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
      expect(valueFound.length).toBe(0);
      done();
    });
  });

  describe('When field type is bitstream', () => {
    beforeEach(() => {
      component.field = bitstreamField;
    });

    describe('and item has no bitstream', () => {

      beforeEach(() => {
        fixture.detectChanges();
      });
      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should not render metadata ', (done) => {
        const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
        expect(spanValueFound.length).toBe(0);

        const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
        expect(valueFound.length).toBe(0);
        done();
      });
    });

    describe('and item has bitstream', () => {

      beforeEach(() => {
        mockBitstreamDataService.findAllByItemAndBundleName.and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([bitstream1])));
        fixture.detectChanges();
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should not render metadata ', (done) => {
        const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
        expect(spanValueFound.length).toBe(1);

        const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
        expect(valueFound.length).toBe(1);
        done();
      });
    });
  });

  describe('Check LoadMoreService',() => {
      let loadMoreService: LoadMoreService;
      const entry =[
        {
          'field':{
              'metadata':'dc.identifier.doi',
              'label':'DOI',
              'rendering':null,
              'fieldType':'METADATA',
              'styleLabel':'font-weight-bold col-3',
              'styleValue':null,
              'labelAsHeading':false,
              'valuesInline':false
          },
          'value':{
              'uuid':'e0f17692-576f-4b2f-a5d5-17c461704b29',
              'language':null,
              'value':'10.1016/j.procs.2017.03.038',
              'place':0,
              'authority':null,
              'confidence':-1
          }
        },
        {
          'field':{
              'metadata':'dc.identifier.doi',
              'label':'DOI',
              'rendering':null,
              'fieldType':'METADATA',
              'styleLabel':'font-weight-bold col-3',
              'styleValue':null,
              'labelAsHeading':false,
              'valuesInline':false
          },
          'value':{
              'uuid':'36169931-7195-41c6-89b4-d6dc7b75ef69',
              'language':null,
              'value':'sas',
              'place':1,
              'authority':null,
              'confidence':-1
          }
        },
        {
          'field':{
              'metadata':'dc.identifier.doi',
              'label':'DOI',
              'rendering':null,
              'fieldType':'METADATA',
              'styleLabel':'font-weight-bold col-3',
              'styleValue':null,
              'labelAsHeading':false,
              'valuesInline':false
          },
          'value':{
              'uuid':'2a7a6a10-0600-4340-b128-eda4e08f852c',
              'language':null,
              'value':'sa67',
              'place':2,
              'authority':null,
              'confidence':-1
          }
        },
        {
          'field':{
              'metadata':'dc.identifier.doi',
              'label':'DOI',
              'rendering':null,
              'fieldType':'METADATA',
              'styleLabel':'font-weight-bold col-3',
              'styleValue':null,
              'labelAsHeading':false,
              'valuesInline':false
          },
          'value':{
              'uuid':'7a75bb92-9af6-4e90-85a4-1d69b2941b1d',
              'language':null,
              'value':'76',
              'place':3,
              'authority':null,
              'confidence':-1
          }
        },
        {
          'field':{
              'metadata':'dc.identifier.doi',
              'label':'DOI',
              'rendering':null,
              'fieldType':'METADATA',
              'styleLabel':'font-weight-bold col-3',
              'styleValue':null,
              'labelAsHeading':false,
              'valuesInline':false
          },
          'value':{
              'uuid':'74ca8dcb-594b-4f57-b54f-942ffeb18466',
              'language':null,
              'value':'899',
              'place':4,
              'authority':null,
              'confidence':-1
          }
        },
        {
          'field':{
              'metadata':'dc.identifier.doi',
              'label':'DOI',
              'rendering':null,
              'fieldType':'METADATA',
              'styleLabel':'font-weight-bold col-3',
              'styleValue':null,
              'labelAsHeading':false,
              'valuesInline':false
          },
          'value':{
              'uuid':'1d032b00-5e59-4352-9471-60ccc077142b',
              'language':null,
              'value':'Testing',
              'place':5,
              'authority':null,
              'confidence':-1
          }
        }
    ] as NestedMetadataGroupEntry[];
      const firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
      const lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
      firstLimitedDataToBeRenderedMap.set(0,[entry[0]]);
      lastLimitedDataToBeRenderedMap.set(4,[entry[4]]);
      lastLimitedDataToBeRenderedMap.set(5,[entry[5]]);

      // const componentsToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>()

      // for (let index = 0; index < entry.length; index++) {
      //     componentsToBeRenderedMap.set(index,[entry[index]]);  
      // }

      beforeEach(() => {
        loadMoreService =  new LoadMoreService();
        spyOn(loadMoreService, 'getComputedData');
        spyOn(loadMoreService, 'fillAllData');
        component.field = fieldMock1;     
        mockLoadMoreService.getComputedData.and.returnValue({
          firstLimitedDataToBeRenderedMap: firstLimitedDataToBeRenderedMap,
          lastLimitedDataToBeRenderedMap: lastLimitedDataToBeRenderedMap,
          isConfigured: true,
          firstLimit: 1,
          lastLimit: 2
        });
        fixture.detectChanges();
      });

      fit('should display data based on configuration', () => {
        // let data: ComputedData = loadMoreService.getComputedData(componentsToBeRenderedMap,'text.more.1.last.2');
        // component.firstLimitedDataToBeRenderedMap = data.firstLimitedDataToBeRenderedMap;
        // component.lastLimitedDataToBeRenderedMap = data.lastLimitedDataToBeRenderedMap;
        // component.isConfigured = data.isConfigured;
        // component.firstLimit = data.firstLimit;
        // component.lastLimit = data.lastLimit;
        expect(loadMoreService.getComputedData).toHaveBeenCalled();
        fixture.detectChanges();
        console.log(component.firstLimitedDataToBeRenderedMap.size);
          
        // expect(component.firstLimitedDataToBeRenderedMap.size).toBe(1);
        // expect(component.lastLimitedDataToBeRenderedMap.size).toBe(2);
        // expect(component.isConfigured).toBe(true);
        // expect(component.firstLimit).toBe(1);
        // expect(component.lastLimit).toBe(2);
        // const moreTag = fixture.debugElement.query(By.css('#a-more'));
        // expect(moreTag).toBeTruthy();
        // moreTag.triggerEventHandler('click',null);
        // expect(loadMoreService.fillAllData).toHaveBeenCalled();
        // const collapseTag = fixture.debugElement.query(By.css('#a-collapse'));
        // expect(moreTag).toBeFalsy();
        // expect(collapseTag).toBeTruthy();
        // expect(component.firstLimitedDataToBeRenderedMap.size).toBe(componentsToBeRenderedMap.size);
        // expect(component.lastLimitedDataToBeRenderedMap.size).toBe(0);
        // collapseTag.triggerEventHandler('click',null);
        // expect(moreTag).toBeTruthy();
        // expect(collapseTag).toBeFalsy();
        // expect(component.firstLimitedDataToBeRenderedMap.size).toBe(1);
        // expect(component.lastLimitedDataToBeRenderedMap.size).toBe(2);
        // expect(component.isConfigured).toBe(true);
        // expect(component.firstLimit).toBe(1);
        // expect(component.lastLimit).toBe(2);
      });

      // it('should display data based on when no configuration is added', () => {
      //   expect(loadMoreService.getComputedData).toHaveBeenCalled();
      //   fixture.detectChanges();
      //   expect(component.firstLimitedDataToBeRenderedMap.size).toBe(componentsToBeRenderedMap.size);
      //   expect(component.lastLimitedDataToBeRenderedMap.size).toBe(1);
      //   expect(component.isConfigured).toBe(false);
      //   expect(component.firstLimit).toBe(0);
      //   expect(component.lastLimit).toBe(0);
      //   const moreTag = fixture.debugElement.query(By.css('#a-more'));
      //   expect(moreTag).toBeFalsy();
      // });
  });
})
;
