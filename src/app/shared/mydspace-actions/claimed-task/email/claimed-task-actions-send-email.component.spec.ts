import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimedTaskActionsSendEmailComponent } from './claimed-task-actions-send-email.component';

xdescribe('EmailComponent', () => {
  let component: ClaimedTaskActionsSendEmailComponent;
  let fixture: ComponentFixture<ClaimedTaskActionsSendEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimedTaskActionsSendEmailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimedTaskActionsSendEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
