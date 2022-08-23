import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLanguageLabelsComponent } from './admin-language-labels.component';

describe('AdminLanguageLabelsComponent', () => {
  let component: AdminLanguageLabelsComponent;
  let fixture: ComponentFixture<AdminLanguageLabelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminLanguageLabelsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLanguageLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
