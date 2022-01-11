import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrisLayoutIIIFToolbarBoxComponent } from './cris-layout-iiif-toolbar-box.component';

describe('CrisLayoutIiifToolbarBoxComponent', () => {
  let component: CrisLayoutIIIFToolbarBoxComponent;
  let fixture: ComponentFixture<CrisLayoutIIIFToolbarBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrisLayoutIIIFToolbarBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisLayoutIIIFToolbarBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
