import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { createTestComponent } from '../shared/testing/utils.test';
import { DeduplicationComponent } from './deduplication.component';
import { DeduplicationStateService } from './deduplication-state.service';
import {
  getMockDeduplicationStateService,
  mockSignatureObjectIdentifier,
  mockSignatureObjectTitle,

} from '../shared/mocks/deduplication.mock';
import { cold } from 'jasmine-marbles';


import { SharedModule } from '../shared/shared.module';


describe('DeduplicationComponent test suite', () => {
  let comp: DeduplicationComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<DeduplicationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
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
    }).compileComponents().then();
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
      // compAsAny.deduplicationStateService.getDeduplicationSignaturesTotalPages.and.returnValue(observableOf(1));
      // compAsAny.deduplicationStateService.getDeduplicationSignaturesCurrentPage.and.returnValue(observableOf(0));
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
      expect(comp.totalPages$).toBeObservable(cold('(a|)', {
        a: 1
      }));
    });

    it(('Should configure data properly after the view init'), () => {
      spyOn(comp, 'addMoreDeduplicationSignatures');

      comp.ngAfterViewInit();
      fixture.detectChanges();

      expect(comp.addMoreDeduplicationSignatures).toHaveBeenCalled();
      // expect(compAsAny.deduplicationStateService.isDeduplicationSignaturesLoaded).toHaveBeenCalled();
    });

    it(('isSignaturesLoading should return FALSE'), () => {
      expect(comp.isSignaturesLoading()).toBeObservable(cold('(a|)', {
        a: false
      }));
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
