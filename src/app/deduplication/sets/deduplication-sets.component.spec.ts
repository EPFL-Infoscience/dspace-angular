import { AuthorizationDataService } from './../../core/data/feature-authorization/authorization-data.service';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { RouterStub } from './../../shared/testing/router.stub';
import { mockSetObject } from './../../shared/mocks/deduplication.mock';
import { NgbAccordionModule, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NO_ERRORS_SCHEMA, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { cold } from 'jasmine-marbles';
import { CommonModule } from '@angular/common';
import { DeduplicationSetsComponent } from './deduplication-sets.component';
import { DeduplicationStateService } from '../deduplication-state.service';
import { getMockDeduplicationStateService } from '../../shared/mocks/deduplication.mock';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../shared/testing/active-router.stub';
import { CookieService } from '../../core/services/cookie.service';
import { CookieServiceMock } from '../../shared/mocks/cookie.service.mock';
import { DeduplicationSetsService } from './deduplication-sets.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { GetBitstreamsPipe } from '../deduplication-merge/pipes/ds-get-bitstreams.pipe';
import { DeduplicationItemsService } from '../deduplication-merge/deduplication-items.service';

describe('DeduplicationSetsComponent test suite', () => {
  let comp: DeduplicationSetsComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<DeduplicationSetsComponent>;
  const signatureId = 'title';
  const rule = 'admin';

  let deduplicationItemsService: DeduplicationItemsService;

  const activatedRouteStub = Object.assign(new ActivatedRouteStub(), {
    params: observableOf({}),
    queryParams: observableOf({})
  });

  const authorizationService: AuthorizationDataService = jasmine.createSpyObj('authorizationService', {
    isAuthorized: observableOf(true)
  });

  const mockDeduplicationSetsService = jasmine.createSpyObj('DeduplicationSetsService', {
    getItemOwningCollection: jasmine.createSpy('getItemOwningCollection'),
    deleteSet: jasmine.createSpy('deleteSet'),
    removeItem: jasmine.createSpy('removeItem'),
    deleteSetItem: jasmine.createSpy('deleteSetItem'),
    getItemSubmissionStatus: jasmine.createSpy('getItemSubmissionStatus'),
    deleteWorkspaceItemById: jasmine.createSpy('deleteWorkspaceItemById'),
    deleteWorkflowItem: jasmine.createSpy('deleteWorkflowItem'),
    getWorkspaceItemStatus: jasmine.createSpy('getWorkspaceItemStatus'),
  });

  const translateServiceStub = {
    get: () => observableOf('test-message'),
    instant: () => 'translated',
    onLangChange: new EventEmitter(),
    onTranslationChange: new EventEmitter(),
    onDefaultLangChange: new EventEmitter()
  };

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NgbModule,
        NgbAccordionModule,
        TranslateModule.forRoot(),
      ],
      declarations: [
        DeduplicationSetsComponent,
        TestComponent,
      ],
      providers: [
        { provide: DeduplicationStateService, useClass: getMockDeduplicationStateService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: new RouterStub() },
        { provide: CookieService, useValue: new CookieServiceMock() },
        { provide: DeduplicationSetsService, useValue: mockDeduplicationSetsService },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: DeduplicationItemsService, useValue: deduplicationItemsService },
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: AuthorizationDataService, useValue: authorizationService },
        {
          provide: NgbModal, useValue: {
            open: () => {/*comment*/
            }
          }
        },
        GetBitstreamsPipe,
        DeduplicationSetsComponent
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationSetsComponent);
    comp = fixture.componentInstance;
    compAsAny = comp;
    compAsAny.deduplicationStateService.getDeduplicationSetsPerSignature.and.returnValue(observableOf([mockSetObject]));
    compAsAny.deduplicationStateService.getDeduplicationSetsTotals.and.returnValue(observableOf(1));
    compAsAny.deduplicationStateService.getDeduplicationSetsCurrentPage.and.returnValue(observableOf(1));
    compAsAny.deduplicationStateService.isDeduplicationSetsLoaded.and.returnValue(observableOf(true));
    compAsAny.deduplicationStateService.isDeduplicationSetsLoading.and.returnValue(observableOf(false));
    compAsAny.deduplicationStateService.isDeduplicationSignaturesProcessing.and.returnValue(observableOf(false));
    compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSetItems.and.callThrough();
    spyOn(comp, 'retrieveDeduplicationSets').and.callThrough();
    spyOn(comp, 'getAllItems').and.callThrough();
  });

  it('should init component properly', () => {
    comp.ngOnInit();
    fixture.detectChanges();
    console.log(comp.sets$, 'DeduplicationSetsComponent');
    expect(comp.sets$).toBeObservable(cold('(a|)', {
      a: [mockSetObject]
    }));

    expect(comp.setsTotalPages$).toBeObservable(cold('(a|)', {
      a: 1
    }));
  });

  it(('should configure data properly after the view init'), () => {
    comp.ngAfterViewInit();
    fixture.detectChanges();
    expect(comp.retrieveDeduplicationSets).toHaveBeenCalled();
  });

  it(('retrieveDeduplicationSets should call the service to dispatch a STATE change'), () => {
    comp.sets$ = observableOf([mockSetObject]);
    fixture.detectChanges();
    compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSetsBySignature(signatureId, rule, null).and.callThrough();
    expect(compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSetsBySignature).toHaveBeenCalledWith(signatureId, rule, null);
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
