import { TextSelectDirective } from './text-select.directive';
import { ElementRef, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('TextSelectDirective', () => {
  let directive: TextSelectDirective;
  let elementRef: ElementRef;
  let ngZone: NgZone;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TextSelectDirective,
        { provide: ElementRef, useValue: { nativeElement: document.createElement('div') } },
        NgZone
      ]
    });

    directive = TestBed.inject(TextSelectDirective);
    elementRef = TestBed.inject(ElementRef);
    ngZone = TestBed.inject(NgZone);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
