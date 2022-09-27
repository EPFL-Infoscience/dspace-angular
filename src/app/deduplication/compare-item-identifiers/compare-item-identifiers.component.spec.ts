import { RouterMock } from './../../shared/mocks/router.mock';
import { ItemDataService } from './../../core/data/item-data.service';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareItemIdentifiersComponent } from './compare-item-identifiers.component';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { WorkspaceitemDataService } from '../../core/submission/workspaceitem-data.service';
import { WorkflowItemDataService } from '../../core/submission/workflowitem-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CookieService } from '../../core/services/cookie.service';
import { CookieServiceMock } from '../../shared/mocks/cookie.service.mock';
import { ChangeDetectorRef, DebugElement, EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('CompareItemIdentifiersComponent', () => {
  let component: CompareItemIdentifiersComponent;
  let fixture: ComponentFixture<CompareItemIdentifiersComponent>;
  let de: DebugElement;

  const itemUuidsToCompare: string = '123, 31, 0db938b1-586e-465b-942c-40145da3452c';

  const itemDataService = jasmine.createSpyObj('ItemDataService', {
    findById: jasmine.createSpy('findById')
  });

  const workspaceItemDataServiceSpy = jasmine.createSpyObj('WorkspaceitemDataService', {
    findById: jasmine.createSpy('findById')
  });

  const mockCdRef = Object.assign({
    detectChanges: () => fixture.detectChanges()
  });

  const translateServiceStub = {
    get: () => of('test-message'),
    onLangChange: new EventEmitter(),
    onTranslationChange: new EventEmitter(),
    onDefaultLangChange: new EventEmitter()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompareItemIdentifiersComponent],
      imports: [
        CommonModule,
        TranslateModule.forRoot(),
        FormsModule
      ],
      providers: [
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: ItemDataService, useValue: itemDataService },
        { provide: WorkspaceitemDataService, useValue: workspaceItemDataServiceSpy },
        { provide: WorkflowItemDataService, useValue: {} },
        {
          provide: NgbModal, useValue: {
            open: () => {/*comment*/
            }
          }
        },
        { provide: Router, useValue: new RouterMock() },
        { provide: CookieService, useValue: new CookieServiceMock() },
        { provide: ChangeDetectorRef, useValue: mockCdRef },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareItemIdentifiersComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    spyOn(component, 'validateItems');
    spyOn(component, 'checkIdValidity');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call validateItems on compare', () => {
    const button = de.query(By.css('.compare-btn'));
    button.nativeElement.click();
    expect(component.validateItems).toHaveBeenCalled();
  });

  afterEach(() => {
    fixture.destroy();
  });
});
