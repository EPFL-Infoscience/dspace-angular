import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IIIFToolbarComponent } from './iiif-toolbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

describe('IiifToolbarComponent', () => {
  let component: IIIFToolbarComponent;
  let fixture: ComponentFixture<IIIFToolbarComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IIIFToolbarComponent ],
      imports: [ RouterTestingModule.withRoutes([]), TranslateModule.forRoot() ],
      providers: [
        {provide: NotificationsService, useValue: NotificationsServiceStub}
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IIIFToolbarComponent);
    component = fixture.componentInstance;
    component.item = {} as any;
    fixture.detectChanges();

    translateService = (component as any).translate;
    spyOn(translateService, 'get').and.returnValue(observableOf('translated-message'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
