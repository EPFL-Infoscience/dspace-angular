import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BreadcrumbsComponent } from './breadcrumbs.component';
import { BreadcrumbsService } from './breadcrumbs.service';
import { Breadcrumb } from './breadcrumb/breadcrumb.model';
import { VarDirective } from '../shared/utils/var.directive';
import { BrowserModule, By } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../shared/testing/translate-loader.mock';
import { RouterTestingModule } from '@angular/router/testing';
import { of as observableOf } from 'rxjs';
import { DebugElement } from '@angular/core';
import { MarkdownDirective } from '../shared/utils/markdown.directive';
import { APP_CONFIG } from '../../config/app-config.interface';
import { environment } from '../../environments/environment';
import { MathService } from '../core/shared/math.service';
import { MathServiceMock } from '../shared/testing/math-service.stub';

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;
  let breadcrumbsServiceMock: BreadcrumbsService;

  const expectBreadcrumb = (listItem: DebugElement, text: string, url: string) => {
    const anchor = listItem.query(By.css('a'));

    if (url == null) {
      expect(anchor).toBeNull();
      expect(listItem.nativeElement.innerHTML).toEqual(text);
    } else {
      expect(anchor).toBeInstanceOf(DebugElement);
      expect(anchor.attributes.href).toEqual(url);
      expect(anchor.nativeElement.innerHTML).toEqual(text);
    }
  };

  beforeEach(waitForAsync(() => {
    breadcrumbsServiceMock = {
      breadcrumbs$: observableOf([
        // NOTE: a root breadcrumb is automatically rendered
        new Breadcrumb('bc 1', 'example.com'),
        new Breadcrumb('bc 2', 'another.com'),
      ]),
      showBreadcrumbs$: observableOf(true),
    } as BreadcrumbsService;

    TestBed.configureTestingModule({
      declarations: [
        BreadcrumbsComponent,
        MarkdownDirective,
        VarDirective,
      ],
      imports: [
        BrowserModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          }
        }),
      ],
      providers: [
        { provide: MathService, useValue: MathServiceMock },
        { provide: BreadcrumbsService, useValue: breadcrumbsServiceMock },
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
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', (done) => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      done();
    });
  });

  it('should render the breadcrumbs', (done) => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const breadcrumbs = fixture.debugElement.queryAll(By.css('.breadcrumb-item'));
      expect(breadcrumbs.length).toBe(3);
      expectBreadcrumb(breadcrumbs[0], 'home.breadcrumbs', '/');
      expectBreadcrumb(breadcrumbs[1], 'bc 1', '/example.com');
      expectBreadcrumb(breadcrumbs[2].query(By.css('.text-truncate')), 'bc 2', null);
      done();
    });
  });

});
