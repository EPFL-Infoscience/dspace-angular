import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, By } from '@angular/platform-browser';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TextComponent } from './text.component';
import { Item } from '../../../../../../../core/shared/item.model';
import { TranslateLoaderMock } from '../../../../../../../shared/mocks/translate-loader.mock';
import { DsDatePipe } from '../../../../../../pipes/ds-date.pipe';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { MarkdownDirective } from '../../../../../../../shared/utils/markdown.directive';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MetadataValuesComponent
} from '../../../../../../../item-page/field-components/metadata-values/metadata-values.component';
import { CommonModule } from '@angular/common';
import { ConsolePipe } from '../../../../../../../shared/utils/console.pipe';
import { APP_CONFIG } from '../../../../../../../../config/app-config.interface';
import { environment } from '../../../../../../../../environments/environment';
import { MathService } from '../../../../../../../core/shared/math.service';
import { MathServiceMock } from '../../../../../../../shared/testing/math-service.stub';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

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
    'rendering': null,
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
        CommonModule,
        TranslateModule.forRoot({
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
      declarations: [TextComponent, DsDatePipe, MarkdownDirective, ConsolePipe],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(MetadataValuesComponent, {
      set: {changeDetection: ChangeDetectionStrategy.OnPush}
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

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
      const spanValueFound = fixture.debugElement.queryAll(By.css('span.text-value'));
      expect(spanValueFound.length).toBe(1);
      expect(spanValueFound[0].nativeElement.innerHTML).toContain(metadataValue.value);
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
