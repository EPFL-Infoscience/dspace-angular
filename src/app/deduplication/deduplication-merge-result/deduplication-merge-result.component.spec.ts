import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeduplicationMergeResultComponent } from './deduplication-merge-result.component';

describe('DeduplicationMergeResultComponent', () => {
  let component: DeduplicationMergeResultComponent;
  let fixture: ComponentFixture<DeduplicationMergeResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeduplicationMergeResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationMergeResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
