import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, inject, async, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { createTestComponent } from '../shared/testing/utils.test';
import { DeduplicationComponent } from './deduplication.component';
import { DeduplicationStateService } from './deduplication-state.service';
import {
  getMockDeduplicationStateService,
  mockSignatureObjectIdentifier,
  mockSignatureObjectTitle,
  mockSignatureObjectOther
} from '../shared/mocks/deduplication.mock';
import { cold } from 'jasmine-marbles';

describe('DeduplicationComponent test suite', () => {
  let comp: DeduplicationComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<DeduplicationComponent>;

  beforeEach(async (() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
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
      compAsAny.deduplicationStateService.getDeduplicationSignaturesTotalPages.and.returnValue(observableOf(1));
      compAsAny.deduplicationStateService.getDeduplicationSignaturesCurrentPage.and.returnValue(observableOf(0));
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
      expect(comp.currentPage$).toBeObservable(cold('(a|)', {
        a: 0
      }));
      expect(comp.totalElements$).toBeObservable(cold('(a|)', {
        a: 3
      }));
      expect(comp.totalRemainingElements).toEqual(0);
    });

    it(('Should configure data properly after the view init'), () => {
      spyOn(comp, 'addMoreDeduplicationSignatures');

      comp.ngAfterViewInit();
      fixture.detectChanges();

      expect(comp.addMoreDeduplicationSignatures).toHaveBeenCalled();
    });

    it(('isSignaturesLoading should return FALSE'), () => {
      expect(comp.isSignaturesLoading()).toBeObservable(cold('(a|)', {
        a: false
      }));
    });

    it(('showMoreButton should return FALSE'), () => {
      comp.ngOnInit();
      fixture.detectChanges();
      expect(comp.showMoreButton()).toBeObservable(cold('(a|)', {
        a: false
      }));
    });

    it(('addMoreDeduplicationSignatures should call the service to dispatch a STATE change'), () => {
      compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSignatures(comp.elementsPerPage).and.callThrough();
      expect(compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSignatures).toHaveBeenCalledWith(comp.elementsPerPage);
    });
  });

  describe('Should work properly with more than three signatures', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DeduplicationComponent);
      comp = fixture.componentInstance;
      compAsAny = comp;
      compAsAny.deduplicationStateService.getDeduplicationSignatures.and.returnValue(observableOf([
        mockSignatureObjectTitle,
        mockSignatureObjectIdentifier,
        mockSignatureObjectOther,
      ]));
      compAsAny.deduplicationStateService.getDeduplicationSignaturesTotalPages.and.returnValue(observableOf(2));
      compAsAny.deduplicationStateService.getDeduplicationSignaturesCurrentPage.and.returnValue(observableOf(0));
      compAsAny.deduplicationStateService.getDeduplicationSignaturesTotals.and.returnValue(observableOf(4));
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
          mockSignatureObjectIdentifier,
          mockSignatureObjectOther
        ]
      }));
      expect(comp.totalPages$).toBeObservable(cold('(a|)', {
        a: 2
      }));
      expect(comp.currentPage$).toBeObservable(cold('(a|)', {
        a: 0
      }));
      expect(comp.totalElements$).toBeObservable(cold('(a|)', {
        a: 4
      }));
      expect(comp.totalRemainingElements).toEqual(0);
    });

    it(('Should configure data properly after the view init'), () => {
      spyOn(comp, 'addMoreDeduplicationSignatures');

      comp.ngAfterViewInit();
      fixture.detectChanges();

      expect(comp.addMoreDeduplicationSignatures).toHaveBeenCalled();
    });

    it(('isSignaturesLoading should return FALSE'), () => {
      expect(comp.isSignaturesLoading()).toBeObservable(cold('(a|)', {
        a: false
      }));
    });

    it(('showMoreButton should return FALSE'), () => {
      comp.ngOnInit();
      fixture.detectChanges();
      expect(comp.showMoreButton()).toBeObservable(cold('(a|)', {
        a: true
      }));
    });

    it(('addMoreDeduplicationSignatures should call the service to dispatch a STATE change'), () => {
      compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSignatures(comp.elementsPerPage).and.callThrough();
      expect(compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSignatures).toHaveBeenCalledWith(comp.elementsPerPage);
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
