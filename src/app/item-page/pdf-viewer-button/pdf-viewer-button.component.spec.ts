import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfViewerButtonComponent } from './pdf-viewer-button.component';

describe('PdfViewerButtonComponent', () => {
  let component: PdfViewerButtonComponent;
  let fixture: ComponentFixture<PdfViewerButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfViewerButtonComponent ]
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
