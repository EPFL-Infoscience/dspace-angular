import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeduplicationPageComponent } from './deduplication-page.component';

describe('DeduplicationPageComponent', () => {
  let component: DeduplicationPageComponent;
  let fixture: ComponentFixture<DeduplicationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeduplicationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create DeduplicationPageComponent', () => {
    expect(component).toBeTruthy();
  });
});
