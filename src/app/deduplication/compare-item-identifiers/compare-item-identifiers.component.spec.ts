import { Observable } from 'rxjs/internal/Observable';
import { createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { WorkspaceItem } from './../../core/submission/models/workspaceitem.model';
import { WorkflowItem } from './../../core/submission/models/workflowitem.model';
import { RouterMock } from './../../shared/mocks/router.mock';
import { ItemDataService } from './../../core/data/item-data.service';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CompareItemIdentifiersComponent,
  ItemErrorMessages,
} from './compare-item-identifiers.component';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { WorkspaceitemDataService } from '../../core/submission/workspaceitem-data.service';
import { WorkflowItemDataService } from '../../core/submission/workflowitem-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CookieService } from '../../core/services/cookie.service';
import { CookieServiceMock } from '../../shared/mocks/cookie.service.mock';
import {
  ChangeDetectorRef,
  DebugElement,
  EventEmitter,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Item } from '../../core/shared/item.model';

describe('CompareItemIdentifiersComponent', () => {
  let component: CompareItemIdentifiersComponent;
  let fixture: ComponentFixture<CompareItemIdentifiersComponent>;
  let de: DebugElement;
  let itemObject: Observable<Item | WorkflowItem | WorkspaceItem>;
  const itemUuidsToCompare = '123,31,0db938b1-586e-465b-942c-456df';
  const ids: string[] = ['123', '31', '0db938b1-586e-465b-942c-456df'];

  const errorMessageList: Map<string, ItemErrorMessages[]> = new Map([
    [
      '31',
      [
        {
          message: 'Unprocessable Entity',
          status: 422,
        },
      ],
    ],
    [
      '123',
      [
        {
          message: 'Not found',
          status: 404,
        },
      ],
    ],
    [
      '0db938b1-586e-465b-942c-456df',
      [
        {
          message: 'Item exists',
          status: 200,
        },
      ],
    ],
  ]);

  const itemDataService = jasmine.createSpyObj('ItemDataService', {
    findById: jasmine.createSpy('findById'),
  });

  const workspaceItemDataServiceSpy = jasmine.createSpyObj(
    'WorkspaceitemDataService',
    {
      findById: jasmine.createSpy('findById'),
    }
  );

  const workflowItemDataServiceSpy = jasmine.createSpyObj(
    'WorkflowItemDataService',
    {
      findById: jasmine.createSpy('findById'),
    }
  );

  const mockCdRef = Object.assign({
    detectChanges: () => fixture.detectChanges(),
  });

  const translateServiceStub = {
    get: () => of('test-message'),
    onLangChange: new EventEmitter(),
    onTranslationChange: new EventEmitter(),
    onDefaultLangChange: new EventEmitter(),
  };

  const modalStub = {
    open: () => null,
    close: () => null,
    dismiss: () => null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompareItemIdentifiersComponent],
      imports: [CommonModule, TranslateModule.forRoot(), FormsModule],
      providers: [
        {
          provide: NotificationsService,
          useValue: new NotificationsServiceStub(),
        },
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: ItemDataService, useValue: itemDataService },
        {
          provide: WorkspaceitemDataService,
          useValue: workspaceItemDataServiceSpy,
        },
        {
          provide: WorkflowItemDataService,
          useValue: workflowItemDataServiceSpy,
        },
        { rovide: NgbModal, useValue: modalStub },
        { provide: Router, useValue: new RouterMock() },
        { provide: CookieService, useValue: new CookieServiceMock() },
        { provide: ChangeDetectorRef, useValue: mockCdRef },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareItemIdentifiersComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call validateItems on compare', () => {
    spyOn(component, 'validateItems');
    const button = de.query(By.css('.compare-btn'));
    button.nativeElement.click();
    expect(component.validateItems).toHaveBeenCalled();
  });

  it('should display error mesages', () => {
    component.errorMessageList = errorMessageList;
    fixture.detectChanges();
    expect(component.errorMessageList.size).toBeGreaterThan(0);

    const jumbotron = de.query(By.css('div.jumbotron'));
    expect(jumbotron).not.toBeNull();
  });

  it('should separate the entered text in a list of identifiers', () => {
    component.itemUuidsToCompare = itemUuidsToCompare;
    fixture.detectChanges();
    const list = component.arrayOfIdentifiers;
    expect(Array.isArray(list)).toBe(true);
    expect(list).toEqual(ids);
  });

  describe('get item status', () => {
    beforeEach(() => {
      itemDataService.findById.and.callFake((uuid) => {
        return createSuccessfulRemoteDataObject$(
          Object.assign(new Item(), {
            uuid: uuid,
          })
        );
      });
      spyOn(component, 'getWorkflowItemStatus').and.callFake((uuid) => {
        return of(null);
      });

      spyOn(component, 'getWorkspaceItemStatus').and.callFake((uuid) => {
        return of(
          Object.assign(new WorkspaceItem(), {
            uuid: uuid,
          })
        );
      });
      spyOn(component, 'getItem').and.callThrough();
      spyOn(component, 'checkIdValidity').and.callThrough();

      itemObject = component.checkIdValidity(ids[0], 0);
    });

    it('checkIdValidity should have been called', (done) => {
      expect(component.checkIdValidity).toHaveBeenCalled();
      expect(component.checkIdValidity).toHaveBeenCalledWith(ids[0], 0);
      done();
    });

    it('checkIdValidity should return item', (done) => {
      itemObject.subscribe((res: Item | WorkflowItem | WorkspaceItem) => {
        expect(res).not.toBeNull();
        expect(res).toBeInstanceOf(Item);
        expect(res.uuid).toEqual(ids[0]);
      });
      done();
    });

    it('getWorkflowItemStatus', (done) => {
      const workflowItem: Observable<WorkflowItem> = component.getWorkflowItemStatus(ids[0]);
      expect(component.getWorkflowItemStatus).toHaveBeenCalled();
      expect(component.getWorkflowItemStatus).toHaveBeenCalledWith(ids[0]);
      workflowItem.subscribe((res) => {
        expect(res).toBeNull();
      });
      done();
    });

    it('getWorkspaceItemStatus', (done) => {
      const workspaceItem: Observable<WorkspaceItem> = component.getWorkspaceItemStatus(ids[1]);
      expect(component.getWorkspaceItemStatus).toHaveBeenCalled();
      expect(component.getWorkspaceItemStatus).toHaveBeenCalledWith(ids[1]);
      workspaceItem.subscribe((res) => {
        expect(res).not.toBeNull();
        expect(res).toBeInstanceOf(WorkspaceItem);
        expect(res.uuid).toEqual(ids[1]);
      });
      done();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
