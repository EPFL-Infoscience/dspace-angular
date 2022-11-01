import { RemoteData } from './../../core/data/remote-data';
import { NoContent } from './../../core/shared/NoContent.model';
import { GetItemStatusListPipe } from './pipes/get-item-status-list.pipe';
import { MetadataValue } from './../../core/shared/metadata.models';
import { Item } from './../../core/shared/item.model';
import { AuthorizationDataService } from './../../core/data/feature-authorization/authorization-data.service';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { RouterStub } from './../../shared/testing/router.stub';
import { mockSetObject } from './../../shared/mocks/deduplication.mock';
import {
  NgbAccordionModule,
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  NO_ERRORS_SCHEMA,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
} from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of as observableOf } from 'rxjs';

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
import { MetadataMap } from '../../core/shared/metadata.models';
import { By } from '@angular/platform-browser';

describe('DeduplicationSetsComponent test suite', () => {
  let comp: DeduplicationSetsComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<DeduplicationSetsComponent>;
  let router;

  const signatureId = 'title';
  const rule = 'admin';
  const item = Object.assign(new Item(), {
    uuid: '11129a891bab61b1b1c04b60edc8344d',
    isDiscoverable: true,
    isWithdrawn: true,
    iisArchived: false,
    metadata: {
      'dc.date.issued': [
        {
          value: '1950-01-01',
        },
      ],
      'dc.title': [{ value: 'item' }],
      'dc.contributor.author': [
        Object.assign(new MetadataValue(), {
          value: 'author1',
        }),
      ],
      'dc.type': [
        {
          language: null,
          value: 'Article',
        },
      ],
    },
  });

  // const mockItemsMap: Map<string, Observable<Item[]>> = new Map([
  //   ['title:d4b9185f91391c0574f4c3dbdd6fa7d3', observableOf([item])],
  // ]);

  const activatedRouteStub = Object.assign(new ActivatedRouteStub(), {
    params: observableOf({}),
    queryParams: observableOf({}),
  });

  const authorizationService: AuthorizationDataService = jasmine.createSpyObj(
    'authorizationService',
    {
      isAuthorized: observableOf(true),
    }
  );

  const noContentRD$ = new Observable<RemoteData<NoContent>>();

  const deduplicationSetsService = jasmine.createSpyObj(
    'deduplicationSetsService',
    {
      getItemOwningCollection: jasmine.createSpy('getItemOwningCollection'),
      deleteSet: noContentRD$,
      removeItem: noContentRD$,
      deleteSetItem: jasmine.createSpy('deleteSetItem'),
      getItemSubmissionStatus: jasmine.createSpy('getItemSubmissionStatus'),
      deleteWorkspaceItemById: jasmine.createSpy('deleteWorkspaceItemById'),
      deleteWorkflowItem: jasmine.createSpy('deleteWorkflowItem'),
      getWorkspaceItemStatus: jasmine.createSpy('getWorkspaceItemStatus'),
    }
  );

  const translateServiceStub = {
    get: () => observableOf('test-message'),
    instant: () => 'translated',
    onLangChange: new EventEmitter(),
    onTranslationChange: new EventEmitter(),
    onDefaultLangChange: new EventEmitter(),
  };

  const notificationsServiceStub = new NotificationsServiceStub();

  beforeEach(fakeAsync(() => {
    router = new RouterStub();
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
        GetItemStatusListPipe,
      ],
      providers: [
        {
          provide: DeduplicationStateService,
          useClass: getMockDeduplicationStateService,
        },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: router },
        { provide: CookieService, useValue: new CookieServiceMock() },
        {
          provide: DeduplicationSetsService,
          useValue: deduplicationSetsService,
        },
        {
          provide: NotificationsService,
          useValue: notificationsServiceStub,
        },
        {
          provide: DeduplicationItemsService,
          useValue: {},
        },
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: AuthorizationDataService, useValue: authorizationService },
        {
          provide: NgbModal,
          useValue: {
            open: () => {
              /*comment*/
            },
          },
        },
        GetBitstreamsPipe,
        DeduplicationSetsComponent,
        GetItemStatusListPipe,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationSetsComponent);
    comp = fixture.componentInstance;
    compAsAny = comp;
    compAsAny.deduplicationStateService.getDeduplicationSetsPerSignature.and.returnValue(
      observableOf([mockSetObject])
    );
    compAsAny.deduplicationStateService.getDeduplicationSetsTotals.and.returnValue(
      observableOf(1)
    );
    compAsAny.deduplicationStateService.getDeduplicationSetsCurrentPage.and.returnValue(
      observableOf(1)
    );
    compAsAny.deduplicationStateService.getDeduplicationSetsTotalPages.and.returnValue(
      observableOf(1)
    );
    compAsAny.deduplicationStateService.isDeduplicationSetsLoaded.and.returnValue(
      observableOf(true)
    );
    compAsAny.deduplicationStateService.isDeduplicationSetsLoading.and.returnValue(
      observableOf(false)
    );
    compAsAny.deduplicationStateService.dispatchRetrieveDeduplicationSetItems.and.callThrough();
    compAsAny.deduplicationStateService.getDeduplicationSetItems.and.returnValue(
      observableOf(new Item())
    );
    spyOn(comp, 'retrieveDeduplicationSets').and.callThrough();
    spyOn(comp, 'isSetsLoading').and.callThrough();
    spyOn(comp, 'isCurrentUserAdmin');
  });

  it('should init component properly', () => {
    comp.ngOnInit();

    expect(comp.sets$).toBeObservable(
      cold('(a|)', {
        a: [mockSetObject],
      })
    );

    expect(comp.setsTotalPages$).toBeObservable(
      cold('(a|)', {
        a: 1,
      })
    );
  });

  it('retrieveDeduplicationSets should call the service to dispatch a STATE change', () => {
    comp.ngAfterViewInit();
    comp.sets$ = observableOf([mockSetObject]);

    expect(comp.retrieveDeduplicationSets).toHaveBeenCalled();
    compAsAny.deduplicationStateService
      .dispatchRetrieveDeduplicationSetsBySignature(signatureId, rule, null)
      .and.callThrough();
    expect(
      compAsAny.deduplicationStateService
        .dispatchRetrieveDeduplicationSetsBySignature
    ).toHaveBeenCalledWith(signatureId, rule, null);
  });

  describe('should get all items and prepare data to display', () => {
    beforeEach(() => {
      comp.sets$ = observableOf([mockSetObject]);
      comp.isSetsLoading();
    });

    // it('should getAllItems ', () => {
    //   expect(
    //     compAsAny.deduplicationStateService.getDeduplicationSetItems
    //   ).toHaveBeenCalledWith(mockSetObject.id);
    //   expect(comp.itemsMap.has(mockSetObject.id)).toBeTrue();
    // });

    it('isDeduplicationSetsLoading should return FALSE', () => {
      const res$ = comp.isSetsLoading();
      expect(res$).toBeObservable(
        cold('(a|)', {
          a: false,
        })
      );

      expect(
        compAsAny.deduplicationStateService.isDeduplicationSetsLoading
      ).toHaveBeenCalled();
    });

    it('should getItemTitle', () => {
      const res = comp.getItemTitle(item.metadata);
      expect(Array.isArray(res)).toBeTruthy();
      expect(res).toEqual(['item']);
    });

    it('should getAuthor', () => {
      const res = comp.getAuthor(new MetadataMap());
      expect(Array.isArray(res)).toBeTruthy();
      expect(res).toEqual(['-']);
    });

    it('should getDateIssued', () => {
      const res = comp.getDateIssued(item.metadata);
      expect(Array.isArray(res)).toBeTruthy();
      expect(res).toEqual(['1950-01-01']);
    });

    it('should getType', () => {
      const res = comp.getType(item.metadata);
      expect(Array.isArray(res)).toBeTruthy();
      expect(res).toEqual(['Article']);
    });
  });

  it('should go back', () => {
    spyOn(comp, 'goBack');
    const button = fixture.debugElement.query(By.css('button.go-back-btn'));
    button.nativeElement.click();
    expect(comp.goBack).toHaveBeenCalled();
    router.navigate(['/admin/deduplication']);
    expect(compAsAny.router.navigate).toHaveBeenCalledWith([
      '/admin/deduplication',
    ]);
  });

  describe('delete elements', () => {
    beforeEach(() => {
      comp.signatureId = signatureId;
      compAsAny.deduplicationStateService.dispatchDeleteSet(signatureId, mockSetObject.id).and.callThrough();
      spyOn(comp, 'dispatchRemoveItem');
    });

    it('should delete set and should call the service to dispatch a STATE change', () => {

      compAsAny.deleteSet(mockSetObject.id, mockSetObject.setChecksum);
      expect(deduplicationSetsService.deleteSet).toHaveBeenCalledWith(
        signatureId,
        mockSetObject.setChecksum
      );
      expect(compAsAny.deduplicationStateService.dispatchDeleteSet).toHaveBeenCalledWith(
        signatureId, mockSetObject.id
      );
    });

    it('should remove items on case of no deduplication', () => {
      compAsAny.removeItem(item.id, mockSetObject.setChecksum, mockSetObject.id);
      expect(deduplicationSetsService.removeItem).toHaveBeenCalledWith(
        signatureId,
        item.id,
        mockSetObject.setChecksum
      );
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});

@Component({
  selector: 'ds-test-component',
  template: ``,
})
class TestComponent { }
