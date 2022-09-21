import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareItemIdentifiersComponent } from './compare-item-identifiers.component';

describe('CompareItemIdentifiersComponent', () => {
  let component: CompareItemIdentifiersComponent;
  let fixture: ComponentFixture<CompareItemIdentifiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompareItemIdentifiersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareItemIdentifiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
