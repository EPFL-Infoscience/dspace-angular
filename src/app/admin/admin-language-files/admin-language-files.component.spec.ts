import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLanguageFilesComponent } from './admin-language-files.component';

describe('AdminLanguageLabelsComponent', () => {
  let component: AdminLanguageFilesComponent;
  let fixture: ComponentFixture<AdminLanguageFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminLanguageFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLanguageFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
