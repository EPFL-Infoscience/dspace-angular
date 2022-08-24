import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLanguageFilesComponent } from './admin-language-files.component';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ObjectCacheService } from '../../core/cache/object-cache.service';
import { RequestService } from '../../core/data/request.service';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { AuthService } from '../../core/auth/auth.service';
import { getMockTranslateService } from '../../shared/mocks/translate.service.mock';
import { of } from 'rxjs';

xdescribe('AdminLanguageLabelsComponent', () => {
  let component: AdminLanguageFilesComponent;
  let fixture: ComponentFixture<AdminLanguageFilesComponent>;

  const halEndpointServiceStub = {
    getEndpoint: () => of('http://localhost:8080/server/api/adminfile/languages{?lang}'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ AdminLanguageFilesComponent ],
      providers: [
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: TranslateService, useValue: getMockTranslateService() },
        { provide: ObjectCacheService, useValue: {} },
        { provide: RequestService, useValue: {} },
        { provide: HALEndpointService, useValue: halEndpointServiceStub },
        { provide: AuthService, useValue: {} },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLanguageFilesComponent);
    component = fixture.componentInstance;
    spyOn(component, 'getLabel').and.returnValues();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
