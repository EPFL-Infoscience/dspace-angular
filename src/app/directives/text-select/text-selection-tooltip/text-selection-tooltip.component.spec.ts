import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextSelectionTooltipComponent } from './text-selection-tooltip.component';

describe('TextSelectionTooltipComponent', () => {
  let component: TextSelectionTooltipComponent;
  let fixture: ComponentFixture<TextSelectionTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextSelectionTooltipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextSelectionTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
