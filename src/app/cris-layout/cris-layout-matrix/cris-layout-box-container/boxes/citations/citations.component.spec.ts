import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ItemCitationService } from '../../../../../core/data/item-citation.service';
import { Citation } from '../../../../../core/shared/citation.model';
import { NotificationsService } from '../../../../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../shared/remote-data.utils';
import { createPaginatedList } from '../../../../../shared/testing/utils.test';
import { CitationsComponent } from './citations.component';

describe('CitationsComponent', () => {
  let component: CitationsComponent;
  let fixture: ComponentFixture<CitationsComponent>;
  let citationServiceStub: any;
  let notificationsServiceStub: any;

  const mockExportType1 = Object.assign(new Citation(), {
    id: '1',
    uniqueType: 'publication-apa',
  });

  const mockExportType2 = Object.assign(new Citation(), {
    id: '2',
    uniqueType: 'publication-ieee',
  });

  const mockCitation1 = Object.assign(new Citation(), {
    id: '1',
    uniqueType: 'publication-apa',
    value: 'APA citation text',
  });

  const mockCitation2 = Object.assign(new Citation(), {
    id: '2',
    uniqueType: 'publication-ieee',
    value: 'IEEE citation text',
  });

  const mockExportTypesRD$ = createSuccessfulRemoteDataObject$(createPaginatedList([mockExportType1, mockExportType2]));
  const emptyCitationsRD$ = createSuccessfulRemoteDataObject$(createPaginatedList([]));

  beforeEach(async () => {
    citationServiceStub = {
      getAllExportTypes: jasmine.createSpy('getAllExportTypes'),
      getExportTypeById: jasmine.createSpy('getExportTypeById'),
    };

    notificationsServiceStub = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error'),
    };

    await TestBed.configureTestingModule({
      declarations: [CitationsComponent],
      imports: [
        CommonModule,
        TranslateModule.forRoot(),
        NgbNavModule,
      ],
      providers: [
        { provide: ItemCitationService, useValue: citationServiceStub },
        { provide: NotificationsService, useValue: notificationsServiceStub },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CitationsComponent);
    component = fixture.componentInstance;
  });

  describe('with citations', () => {

    beforeEach(() => {
      citationServiceStub.getAllExportTypes.and.returnValue(mockExportTypesRD$);
      citationServiceStub.getExportTypeById.and.callFake((id: string) => {
        if (id === mockCitation1.uniqueType) {
          return createSuccessfulRemoteDataObject$(mockCitation1);
        }

        if (id === mockCitation2.uniqueType) {
          return createSuccessfulRemoteDataObject$(mockCitation2);
        }

        return createSuccessfulRemoteDataObject$(null);
      });

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render tabs when citations exist', () => {
      const navLinks = fixture.debugElement.queryAll(By.css('.nav-tabs a'));
      expect(navLinks.length).toBe(2);
    });

    it('should call getAllExportTypes on init', () => {
      expect(citationServiceStub.getAllExportTypes).toHaveBeenCalled();
    });

    it('should NOT call getExportTypeById on init', () => {
      expect(citationServiceStub.getExportTypeById).not.toHaveBeenCalled();
    });

    it('should lazy-load citation when tab is selected', fakeAsync(() => {
      component.onTabChange('publication-apa');
      fixture.detectChanges();
      tick();
      expect(citationServiceStub.getExportTypeById).toHaveBeenCalledWith('publication-apa');
    }));

    it('should display citation content after tab selection', fakeAsync(() => {
      component.onTabChange('publication-apa');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const citationTexts = fixture.debugElement.queryAll(By.css('.citation-text'));
      expect(citationTexts.length).toBeGreaterThan(0);
      expect(citationTexts[0].nativeElement.textContent).toContain('APA citation text');
    }));

    it('should copy citation text and show success notification', fakeAsync(() => {
      component.onTabChange('publication-apa');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      const copyButtons = fixture.debugElement.queryAll(By.css('.btn-outline-primary'));
      expect(copyButtons.length).toBeGreaterThan(0);
      copyButtons[0].nativeElement.click();
      tick();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('APA citation text');
      expect(notificationsServiceStub.success).toHaveBeenCalled();
    }));

    it('should show error notification when copy fails', fakeAsync(() => {
      component.onTabChange('publication-apa');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject());
      const copyButtons = fixture.debugElement.queryAll(By.css('.btn-outline-primary'));
      expect(copyButtons.length).toBeGreaterThan(0);
      copyButtons[0].nativeElement.click();
      tick();
      expect(notificationsServiceStub.error).toHaveBeenCalled();
    }));

    it('should show error notification when clipboard is unavailable', fakeAsync(() => {
      component.onTabChange('publication-apa');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      });
      const copyButtons = fixture.debugElement.queryAll(By.css('.btn-outline-primary'));
      expect(copyButtons.length).toBeGreaterThan(0);
      copyButtons[0].nativeElement.click();
      expect(notificationsServiceStub.error).toHaveBeenCalled();
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true,
      });
    }));
  });

  describe('without citations', () => {

    beforeEach(() => {
      citationServiceStub.getAllExportTypes.and.returnValue(emptyCitationsRD$);
      fixture.detectChanges();
    });

    it('should show nothing when no citations exist', () => {
      const navLinks = fixture.debugElement.queryAll(By.css('.nav-tabs a'));
      expect(navLinks.length).toBe(0);
    });
  });
});
