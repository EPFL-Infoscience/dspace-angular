import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeduplicationMergeComponent } from './deduplication-merge.component';

describe('DeduplicationMergeComponent', () => {
  let component: DeduplicationMergeComponent;
  let fixture: ComponentFixture<DeduplicationMergeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeduplicationMergeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
