import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionSectionUnpaywallComponent } from './submission-section-unpaywall.component';

describe('SubmissionSectionUnpaywallComponentComponent', () => {
  let component: SubmissionSectionUnpaywallComponent;
  let fixture: ComponentFixture<SubmissionSectionUnpaywallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubmissionSectionUnpaywallComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionSectionUnpaywallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
