import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrisLayoutMediaBoxComponent } from './cris-layout-media-box.component';

describe('CrisLayoutMediaBoxComponent', () => {
  let component: CrisLayoutMediaBoxComponent;
  let fixture: ComponentFixture<CrisLayoutMediaBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrisLayoutMediaBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisLayoutMediaBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
