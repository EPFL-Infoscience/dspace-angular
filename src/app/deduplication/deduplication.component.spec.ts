import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NO_ERRORS_SCHEMA, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { DeduplicationComponent } from './deduplication.component';
import { DeduplicationStateService } from './deduplication-state.service';
import {
  getMockDeduplicationStateService,
  mockSignatureObjectIdentifier,
  mockSignatureObjectTitle,

} from '../shared/mocks/deduplication.mock';
import { cold } from 'jasmine-marbles';
import { CommonModule } from '@angular/common';


describe('DeduplicationComponent test suite', () => {
  let comp: DeduplicationComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<DeduplicationComponent>;

  beforeEach(fakeAsync(() => {
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
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationComponent);
    comp = fixture.componentInstance;
    compAsAny = comp;
    compAsAny.deduplicationStateService.getDeduplicationSignatures.and.returnValue(observableOf([
      mockSignatureObjectTitle,
      mockSignatureObjectIdentifier
    ]));
    compAsAny.deduplicationStateService.getDeduplicationSignaturesTotals.and.returnValue(observableOf(2));
    compAsAny.deduplicationStateService.getDeduplicationSignaturesTotalPages.and.returnValue(observableOf(1));
    compAsAny.deduplicationStateService.isDeduplicationSignaturesLoaded.and.returnValue(observableOf(true));
    compAsAny.deduplicationStateService.isDeduplicationSignaturesLoading.and.returnValue(observableOf(false));
    compAsAny.deduplicationStateService.isDeduplicationSignaturesProcessing.and.returnValue(observableOf(false));
    spyOn(comp, 'addMoreDeduplicationSignatures').and.callThrough();
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
    comp.ngAfterViewInit();
    fixture.detectChanges();

    expect(comp.addMoreDeduplicationSignatures).toHaveBeenCalled();
  });

  it(('addMoreDeduplicationSignatures should call the service to dispatch a STATE change'), () => {
    compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSignatures().and.callThrough();
    expect(compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSignatures).toHaveBeenCalledWith();
  });

  afterEach(() => {
    fixture.destroy();
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {

}
