import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaItemViewerComponent } from './media-item-viewer.component';

describe('MediaItemViewerComponent', () => {
  let component: MediaItemViewerComponent;
  let fixture: ComponentFixture<MediaItemViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaItemViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaItemViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
