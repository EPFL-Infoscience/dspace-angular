import { getMockDeduplicationStateService, mockSignatureObjectTitle } from './../../../shared/mocks/deduplication.mock';

import { CommonModule } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DeduplicationSignaturesComponent } from './deduplication-signatures.component';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { DeduplicationStateService } from '../../deduplication-state.service';

describe('DeduplicationSignaturesComponent test suite', () => {
  let fixture: ComponentFixture<DeduplicationSignaturesComponent>;
  let comp: DeduplicationSignaturesComponent;
  let compAsAny: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule.forRoot()],
      declarations: [DeduplicationSignaturesComponent, TestComponent],
      providers: [
        DeduplicationSignaturesComponent,
        {
          provide: DeduplicationStateService,
          useClass: getMockDeduplicationStateService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationSignaturesComponent);
    comp = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    comp = null;
    compAsAny = null;
  });

  it('should init component properly', () => {
    comp.elementsPerRow = 3;
    comp.ngOnInit();
    fixture.detectChanges();

    expect(comp.bootstrapColNumber).toEqual(4);
  });

  it('should clear store on redirect', () => {
    comp.signatures = of([mockSignatureObjectTitle]);
    spyOn(comp, 'onRedirect');
    fixture.detectChanges();
    const link = fixture.debugElement.query(By.css('a.redirect-link'));
    link.nativeElement.click();
    expect(comp.onRedirect).toHaveBeenCalled();
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
})
class TestComponent {}
