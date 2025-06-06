// Load the implementations that should be tested
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject,  TestBed, waitForAsync, } from '@angular/core/testing';

import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';

import { DragService } from '../../../core/drag.service';
import { UploaderOptions } from './uploader-options.model';
import { UploaderComponent } from './uploader.component';
import { FileUploadModule } from 'ng2-file-upload';
import { TranslateModule } from '@ngx-translate/core';
import { createTestComponent } from '../../testing/utils.test';
import { HttpXsrfTokenExtractor } from '@angular/common/http';
import { CookieService } from '../../../core/services/cookie.service';
import { CookieServiceMock } from '../../mocks/cookie.service.mock';
import { HttpXsrfTokenExtractorMock } from '../../mocks/http-xsrf-token-extractor.mock';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthServiceMock } from '../../mocks/auth.service.mock';
import { KeepConnectionAliveService } from '../../../core/shared/keep-connection-alive.service';
import { KeepConnectionAliveServiceMock } from '../../mocks/keep-connection-alive.service.mock';

describe('UploaderComponent test', () => {

  let testComp: TestComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let html;

  // waitForAsync beforeEach
  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      imports: [
        FileUploadModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        UploaderComponent,
        TestComponent,
      ], // declare the test component
      providers: [
        ChangeDetectorRef,
        ScrollToService,
        UploaderComponent,
        DragService,
        { provide: AuthService, useValue: new AuthServiceMock() },
        { provide: HttpXsrfTokenExtractor, useValue: new HttpXsrfTokenExtractorMock('mock-token') },
        { provide: CookieService, useValue: new CookieServiceMock() },
        { provide: KeepConnectionAliveService, useValue: new KeepConnectionAliveServiceMock() },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

  }));

  // synchronous beforeEach
  beforeEach(() => {
    html = `
      <ds-uploader [onAfterUpload]="onAfterUpload"
                   [uploadFilesOptions]="uploadFilesOptions"
                   (onCompleteItem)="onCompleteItem($event)"></ds-uploader>`;

    testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
    testComp = testFixture.componentInstance;
  });

  it('should create Uploader Component', inject([UploaderComponent], (app: UploaderComponent) => {

    expect(app).toBeDefined();
  }));

});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {
  public uploadFilesOptions: UploaderOptions = Object.assign(new UploaderOptions(), {
    url: 'http://test',
    authToken: null,
    disableMultipart: false,
    itemAlias: null
  });

  /* eslint-disable no-empty,@typescript-eslint/no-empty-function */
  public onAfterUpload = () => {
  };

  onCompleteItem(event) {
  }

  /* eslint-enable no-empty, @typescript-eslint/no-empty-function */
}
