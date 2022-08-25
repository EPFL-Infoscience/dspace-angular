import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitstreamTableComponent } from './bitstream-table.component';

describe('BitstreamTableComponent', () => {
  let component: BitstreamTableComponent;
  let fixture: ComponentFixture<BitstreamTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BitstreamTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BitstreamTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
