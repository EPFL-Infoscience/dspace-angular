import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../../core/shared/item.model';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { TranslateLoaderMock } from '../../../../../../../shared/mocks/translate-loader.mock';
import { OsmapComponent } from './osmap.component';

describe('OsmapComponent', () => {
  let component: OsmapComponent;
  let fixture: ComponentFixture<OsmapComponent>;

  const metadataValue = Object.assign(new MetadataValue(), {
    'value': '@42.1334,56.7654',
    'language': null,
    'authority': null,
    'confidence': -1,
    'place': 0
  });

  const testItem = Object.assign(new Item(),
    {
      type: 'item',
      metadata: {
        'organization.address.addressLocality': [metadataValue]
      },
      uuid: 'test-item-uuid',
    }
  );

  const mockField: LayoutField = {
    'metadata': 'organization.address.addressLocality',
    'label': 'Preferred name',
    'rendering': 'OSMAP',
    'fieldType': 'METADATA',
    'style': null,
    'styleLabel': 'test-style-label',
    'styleValue': 'test-style-value',
    'labelAsHeading': false,
    'valuesInline': true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      }), BrowserAnimationsModule],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'metadataValueProvider', useValue: metadataValue },
        { provide: 'renderingSubTypeProvider', useValue: '' },
      ],
      declarations: [ OsmapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OsmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

//   it('should rendered google map.',() => {
//     component.coordinates = '@42.1334,56.7654';
//     fixture.detectChanges();
//     const container = fixture.debugElement.query(By.css('#googlemap'));
//     expect(container).toBeTruthy();
//   });

//   it('should not rendered google map.',() => {
//     component.coordinates = undefined;
//     fixture.detectChanges();
//     const container = fixture.debugElement.query(By.css('#googlemap'));
//     expect(container).toBeFalsy();
//   });

});
