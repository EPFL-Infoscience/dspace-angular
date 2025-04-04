import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { SearchComponent } from './search.component';
import { Item } from '../../../../../../../core/shared/item.model';
import { TranslateLoaderMock } from '../../../../../../../shared/mocks/translate-loader.mock';
import { DsDatePipe } from '../../../../../../pipes/ds-date.pipe';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownDirective } from '../../../../../../../shared/utils/markdown.directive';
import { MathService } from '../../../../../../../core/shared/math.service';
import { MathServiceMock } from '../../../../../../../shared/testing/math-service.stub';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

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
        'dc.title': [metadataValue]
      },
      uuid: 'test-item-uuid',
    }
  );


  const mockField: LayoutField = {
    'metadata': 'dc.title',
    'label': 'Title',
    'rendering': 'search.title',
    'fieldType': 'METADATA',
    'style': null,
    'styleLabel': 'test-style-label',
    'styleValue': 'test-style-value',
    'labelAsHeading': false,
    'valuesInline': true
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      }), BrowserAnimationsModule, RouterTestingModule],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'metadataValueProvider', useValue: metadataValue },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: 'tabNameProvider', useValue: '' },
        { provide: MathService, useValue: MathServiceMock },
      ],
      declarations: [SearchComponent, DsDatePipe, MarkdownDirective]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('check metadata rendering', (done) => {
    fixture.detectChanges();

    const formattedText = fixture.debugElement.query(By.css('[data-test="formatted-text"]')).nativeElement.innerHTML;
    expect(formattedText).toContain(metadataValue.value);
    done();
  });

  it('check value style', (done) => {
    const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-value'));
    expect(spanValueFound.length).toBe(1);
    done();
  });

});
