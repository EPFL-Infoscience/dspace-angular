import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfViewerButtonComponent } from './pdf-viewer-button.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('PdfViewerButtonComponent', () => {
  let component: PdfViewerButtonComponent;
  let fixture: ComponentFixture<PdfViewerButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfViewerButtonComponent ],
      imports: [ RouterTestingModule.withRoutes([]), TranslateModule.forRoot() ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfViewerButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
