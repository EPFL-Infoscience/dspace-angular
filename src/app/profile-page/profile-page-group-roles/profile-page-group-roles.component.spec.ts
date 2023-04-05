import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePageGroupRolesComponent } from './profile-page-group-roles.component';

describe('ProfilePageGroupRolesComponent', () => {
  let component: ProfilePageGroupRolesComponent;
  let fixture: ComponentFixture<ProfilePageGroupRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilePageGroupRolesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePageGroupRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
