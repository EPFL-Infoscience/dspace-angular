import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSubmitterButtonComponent } from './change-submitter-button.component';

xdescribe('ChangeSubmitterButtonComponent', () => {
  let component: ChangeSubmitterButtonComponent;
  let fixture: ComponentFixture<ChangeSubmitterButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeSubmitterButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSubmitterButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
