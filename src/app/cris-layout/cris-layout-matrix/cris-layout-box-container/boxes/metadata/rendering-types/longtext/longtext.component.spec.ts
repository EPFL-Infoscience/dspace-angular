import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, By } from '@angular/platform-browser';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { LongtextComponent } from './longtext.component';
import { Item } from '../../../../../../../core/shared/item.model';
import { TranslateLoaderMock } from '../../../../../../../shared/mocks/translate-loader.mock';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { MarkdownDirective } from '../../../../../../../shared/utils/markdown.directive';
import { APP_CONFIG } from '../../../../../../../../config/app-config.interface';
import { environment } from '../../../../../../../../environments/environment';
import { MathService } from '../../../../../../../core/shared/math.service';
import { MathServiceMock } from '../../../../../../../shared/testing/math-service.stub';

describe('LongtextComponent', () => {
  let component: LongtextComponent;
  let fixture: ComponentFixture<LongtextComponent>;

  const metadataValue = Object.assign(new MetadataValue(), {
    'value': '<b>Lorem Ipsum</b> is simply dummy text of the printing and typesetting industry.\nLorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.\nIt has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\nIt was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
    'language': null,
    'authority': null,
    'confidence': -1,
    'place': 0
  });

  const testItem = Object.assign(new Item(),
    {
      type: 'item',
      metadata: {
        'dc.abstract': [metadataValue]
      },
      uuid: 'test-item-uuid',
    }
  );


  const mockField: LayoutField = {
    'metadata': 'dc.abstract',
    'label': 'Preferred name',
    'rendering': 'LONGTEXT',
    'fieldType': 'METADATA',
    'style': null,
    'styleLabel': 'test-style-label',
    'styleValue': 'test-style-value',
    'labelAsHeading': false,
    'valuesInline': true
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
        BrowserAnimationsModule
      ],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'metadataValueProvider', useValue: metadataValue },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: MathService, useValue: MathServiceMock },
        { provide: 'tabNameProvider', useValue: '' },
        {
          provide: APP_CONFIG,
          useValue: Object.assign(environment, {
            markdown: {
              enabled: false,
              mathjax: false,
            }
          })
        },
      ],
      declarations: [LongtextComponent, MarkdownDirective]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component = null;
    fixture = null;
  });

  it('should create', (done) => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      done();
    });
  });

  it('check metadata rendering', (done) => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const formattedText = fixture.debugElement.query(By.css('[data-test="formatted-text"]')).nativeElement.innerHTML;
      const breaklineCount = formattedText.match(/<br>/g)?.length;

      expect(breaklineCount).toBe(3);
      expect(formattedText).toContain('&lt;b&gt;Lorem Ipsum&lt;/b&gt;');

      done();
    });
  });

  it('check value style', (done) => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-value'));
      expect(spanValueFound.length).toBe(1);
      done();
    });
  });

});
