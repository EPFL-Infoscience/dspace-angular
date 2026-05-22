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
import { of } from 'rxjs';

import { ItemAvailableCitationsService } from '../../../../../core/data/citations/item-available-citations.service';
import { Citation } from '../../../../../core/shared/citation.model';
import { NotificationsService } from '../../../../../shared/notifications/notifications.service';
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

  beforeEach(async () => {
    citationServiceStub = {
      getAllAvailableCitations: jasmine.createSpy('getAllAvailableCitations'),
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
        { provide: ItemAvailableCitationsService, useValue: citationServiceStub },
        { provide: NotificationsService, useValue: notificationsServiceStub },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CitationsComponent);
    component = fixture.componentInstance;
  });

  describe('with citations', () => {

    beforeEach(() => {
      citationServiceStub.getAllAvailableCitations.and.returnValue(of([
        mockCitation1,
        mockCitation2,
      ]));

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render tabs when citations exist', () => {
      const navLinks = fixture.debugElement.queryAll(By.css('.nav-tabs a'));
      expect(navLinks.length).toBe(2);
    });

    it('should call getAllAvailableCitations on init', () => {
      expect(citationServiceStub.getAllAvailableCitations).toHaveBeenCalled();
    });

    it('should display citation content without tab selection', () => {
      fixture.detectChanges();
      const citationTexts = fixture.debugElement.queryAll(By.css('.citation-text'));
      expect(citationTexts.length).toBeGreaterThan(0);
      expect(citationTexts[0].nativeElement.textContent).toContain('APA citation text');
    });

    it('should expand and collapse citation text', () => {
      const toggleButtons = fixture.debugElement.queryAll(By.css('.btn-outline-secondary'));
      expect(toggleButtons.length).toBeGreaterThan(0);

      expect(fixture.debugElement.query(By.css('.citation-text-wrapper')).nativeElement.classList.contains('is-expanded')).toBeFalse();

      toggleButtons[0].nativeElement.click();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.citation-text-wrapper')).nativeElement.classList.contains('is-expanded')).toBeTrue();
      expect(toggleButtons[0].nativeElement.textContent).toContain('Show less');
    });

    it('should copy citation text and show success notification', fakeAsync(() => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      const copyButtons = fixture.debugElement.queryAll(By.css('.btn-outline-primary'));
      expect(copyButtons.length).toBeGreaterThan(0);
      copyButtons[0].nativeElement.click();
      tick();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('APA citation text');
      expect(notificationsServiceStub.success).toHaveBeenCalled();
    }));

    it('should show error notification when copy fails', fakeAsync(() => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject());
      const copyButtons = fixture.debugElement.queryAll(By.css('.btn-outline-primary'));
      expect(copyButtons.length).toBeGreaterThan(0);
      copyButtons[0].nativeElement.click();
      tick();
      expect(notificationsServiceStub.error).toHaveBeenCalled();
    }));

    it('should show error notification when clipboard is unavailable', fakeAsync(() => {
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
      citationServiceStub.getAllAvailableCitations.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should show nothing when no citations exist', () => {
      const navLinks = fixture.debugElement.queryAll(By.css('.nav-tabs a'));
      expect(navLinks.length).toBe(0);
    });
  });
});
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
import { of } from 'rxjs';

import { ItemAvailableCitationsService } from '../../../../../core/data/citations/item-available-citations.service';
import { Citation } from '../../../../../core/shared/citation.model';
import { NotificationsService } from '../../../../../shared/notifications/notifications.service';
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

  beforeEach(async () => {
    citationServiceStub = {
      getAllAvailableCitations: jasmine.createSpy('getAllAvailableCitations'),
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
        { provide: ItemAvailableCitationsService, useValue: citationServiceStub },
        { provide: NotificationsService, useValue: notificationsServiceStub },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CitationsComponent);
    component = fixture.componentInstance;
  });

  describe('with citations', () => {

    beforeEach(() => {
      citationServiceStub.getAllAvailableCitations.and.returnValue(of([
        mockCitation1,
        mockCitation2,
      ]));

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render tabs when citations exist', () => {
      const navLinks = fixture.debugElement.queryAll(By.css('.nav-tabs a'));
      expect(navLinks.length).toBe(2);
    });

    it('should call getAllAvailableCitations on init', () => {
      expect(citationServiceStub.getAllAvailableCitations).toHaveBeenCalled();
    });

    it('should display citation content without tab selection', () => {
      fixture.detectChanges();
      const citationTexts = fixture.debugElement.queryAll(By.css('.citation-text'));
      expect(citationTexts.length).toBeGreaterThan(0);
      expect(citationTexts[0].nativeElement.textContent).toContain('APA citation text');
    });

    it('should expand and collapse citation text', () => {
      const toggleButtons = fixture.debugElement.queryAll(By.css('.btn-outline-secondary'));
      expect(toggleButtons.length).toBeGreaterThan(0);

      expect(fixture.debugElement.query(By.css('.citation-text-wrapper')).nativeElement.classList.contains('is-expanded')).toBeFalse();

      toggleButtons[0].nativeElement.click();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.citation-text-wrapper')).nativeElement.classList.contains('is-expanded')).toBeTrue();
      expect(toggleButtons[0].nativeElement.textContent).toContain('Show less');
    });

    it('should copy citation text and show success notification', fakeAsync(() => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      const copyButtons = fixture.debugElement.queryAll(By.css('.btn-outline-primary'));
      expect(copyButtons.length).toBeGreaterThan(0);
      copyButtons[0].nativeElement.click();
      tick();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('APA citation text');
      expect(notificationsServiceStub.success).toHaveBeenCalled();
    }));

    it('should show error notification when copy fails', fakeAsync(() => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject());
      const copyButtons = fixture.debugElement.queryAll(By.css('.btn-outline-primary'));
      expect(copyButtons.length).toBeGreaterThan(0);
      copyButtons[0].nativeElement.click();
      tick();
      expect(notificationsServiceStub.error).toHaveBeenCalled();
    }));

    it('should show error notification when clipboard is unavailable', fakeAsync(() => {
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
      citationServiceStub.getAllAvailableCitations.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should show nothing when no citations exist', () => {
      const navLinks = fixture.debugElement.queryAll(By.css('.nav-tabs a'));
      expect(navLinks.length).toBe(0);
    });
  });
});
