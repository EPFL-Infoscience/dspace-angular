import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IIIFViewerComponent } from './iiif-viewer.component';

describe('IiifViewerComponent', () => {
  let component: IIIFViewerComponent;
  let fixture: ComponentFixture<IIIFViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IIIFViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IIIFViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
