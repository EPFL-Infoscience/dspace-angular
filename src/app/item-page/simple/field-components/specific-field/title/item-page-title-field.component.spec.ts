import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateLoaderMock } from '../../../../../shared/testing/translate-loader.mock';
import { MetadataValuesComponent } from '../../../../field-components/metadata-values/metadata-values.component';
import { mockItemWithMetadataFieldsAndValue } from '../item-page-field.component.spec';
import { ItemPageTitleFieldComponent } from './item-page-title-field.component';
import { MarkdownDirective } from '../../../../../shared/utils/markdown.directive';
import { BrowserModule } from '@angular/platform-browser';
import { APP_CONFIG } from '../../../../../../config/app-config.interface';
import { environment } from '../../../../../../environments/environment';
import { MathService } from '../../../../../core/shared/math.service';
import { MathServiceMock } from '../../../../../shared/testing/math-service.stub';

let comp: ItemPageTitleFieldComponent;
let fixture: ComponentFixture<ItemPageTitleFieldComponent>;

const mockField = 'dc.title';
const mockValue = 'test value';

describe('ItemPageTitleFieldComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      declarations: [ItemPageTitleFieldComponent, MarkdownDirective, MetadataValuesComponent],
      providers: [
        {
          provide: APP_CONFIG,
          useValue: Object.assign(environment, {
            markdown: {
              enabled: false,
              mathjax: false,
            }
          })
        },
        { provide: MathService, useValue: MathServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ItemPageTitleFieldComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemPageTitleFieldComponent);
    comp = fixture.componentInstance;
    comp.item = mockItemWithMetadataFieldsAndValue([mockField], mockValue);
    fixture.detectChanges();
  }));

  it('should display display the correct metadata value', (done) => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toContain(mockValue);
      done();
    });
  });
});
