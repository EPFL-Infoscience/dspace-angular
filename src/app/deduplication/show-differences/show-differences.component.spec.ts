import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDifferencesComponent } from './show-differences.component';

describe('ShowDifferencesComponent', () => {
  let component: ShowDifferencesComponent;
  let fixture: ComponentFixture<ShowDifferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowDifferencesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowDifferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
