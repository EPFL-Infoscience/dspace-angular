import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ShowDifferencesComponent } from './show-differences.component';

describe('ShowDifferencesComponent', () => {
  let component: ShowDifferencesComponent;
  let fixture: ComponentFixture<ShowDifferencesComponent>;
  const modalStub = jasmine.createSpyObj('modal', ['close', 'dismiss']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowDifferencesComponent ],
      providers: [
        { provide: NgbActiveModal, useValue: modalStub }
      ],
      imports:[
        CommonModule,
        NgbModule,
        TranslateModule.forRoot(),
      ]
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
