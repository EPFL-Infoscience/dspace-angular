import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDeduplicationPageComponent } from './admin-deduplication-page.component';

describe('DeduplicationPageComponent', () => {
  let component: AdminDeduplicationPageComponent;
  let fixture: ComponentFixture<AdminDeduplicationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDeduplicationPageComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDeduplicationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create AdminDeduplicationPageComponent', () => {
    expect(component).toBeTruthy();
  });
});
