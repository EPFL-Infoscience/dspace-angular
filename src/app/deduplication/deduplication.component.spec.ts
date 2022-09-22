import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { async, of as observableOf } from 'rxjs';
import { createTestComponent } from '../shared/testing/utils.test';
import { DeduplicationComponent } from './deduplication.component';
import { DeduplicationStateService } from './deduplication-state.service';
import {
  getMockDeduplicationStateService,
  mockSignatureObjectIdentifier,
  mockSignatureObjectTitle,

} from '../shared/mocks/deduplication.mock';
import { cold } from 'jasmine-marbles';

import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';


describe('DeduplicationComponent test suite', () => {
  let comp: DeduplicationComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<DeduplicationComponent>;
  let isLoading;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NgbModule,
        TranslateModule.forRoot(),
      ],
      declarations: [
        DeduplicationComponent,
        TestComponent,
      ],
      providers: [
        { provide: DeduplicationStateService, useClass: getMockDeduplicationStateService },
        DeduplicationComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  // First test to check the correct component creation
  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `
        <ds-deduplication></ds-deduplication>`;
      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create DeduplicationComponent', inject([DeduplicationComponent], (app: DeduplicationComponent) => {
      expect(app).toBeDefined();
    }));
  });

  describe('Should work properly with less than three signatures', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DeduplicationComponent);
      comp = fixture.componentInstance;
      compAsAny = comp;
      compAsAny.deduplicationStateService.getDeduplicationSignatures.and.returnValue(observableOf([
        mockSignatureObjectTitle,
        mockSignatureObjectIdentifier
      ]));
      compAsAny.deduplicationStateService.getDeduplicationSignaturesTotals.and.returnValue(observableOf(3));
      compAsAny.deduplicationStateService.isDeduplicationSignaturesLoaded.and.returnValue(observableOf(true));
      compAsAny.deduplicationStateService.isDeduplicationSignaturesLoading.and.returnValue(observableOf(false));
      compAsAny.deduplicationStateService.isDeduplicationSignaturesProcessing.and.returnValue(observableOf(false));
    });

    afterEach(() => {
      fixture.destroy();
      comp = null;
      compAsAny = null;
    });

    it('Should init component properly', () => {
      comp.ngOnInit();
      fixture.detectChanges();

      expect(comp.signatures$).toBeObservable(cold('(a|)', {
        a: [
          mockSignatureObjectTitle,
          mockSignatureObjectIdentifier
        ]
      }));
    });

    it(('Should configure data properly after the view init'), () => {
      spyOn(comp, 'addMoreDeduplicationSignatures');

      comp.ngAfterViewInit();
      fixture.detectChanges();
      expect(compAsAny.deduplicationStateService.isDeduplicationSignaturesLoaded).toHaveBeenCalled();

      compAsAny.deduplicationStateService.isDeduplicationSignaturesLoaded().pipe(take(1))
        .subscribe(() => {
          expect(comp.addMoreDeduplicationSignatures).toHaveBeenCalled();
        });
    });

    it(('addMoreDeduplicationSignatures should call the service to dispatch a STATE change'), () => {
      compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSignatures().and.callThrough();
      expect(compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSignatures).toHaveBeenCalledWith();
    });
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {

}
