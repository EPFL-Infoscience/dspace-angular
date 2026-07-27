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

import { Item } from '../../../../../core/shared/item.model';
import { ItemAvailableCitationsService } from '../../../../../core/data/citations/item-available-citations.service';
import { MathService } from '../../../../../core/shared/math.service';
import { Citation } from '../../../../../core/shared/citation.model';
import { NotificationsService } from '../../../../../shared/notifications/notifications.service';
import { MarkdownDirective } from '../../../../../shared/utils/markdown.directive';
import { CitationsComponent } from './citations.component';

describe('CitationsComponent', () => {
  let component: CitationsComponent;
  let fixture: ComponentFixture<CitationsComponent>;
  let citationServiceStub: any;
  let notificationsServiceStub: any;

  const mockExportType1 = Object.assign(new Citation(), {
    id: '1',
    exportType: 'publication-apa',
  });

  const mockExportType2 = Object.assign(new Citation(), {
    id: '2',
    exportType: 'publication-ieee',
  });

  const mockCitation1 = Object.assign(new Citation(), {
    id: '1',
    exportType: 'publication-apa',
    value: 'APA citation text',
  });

  const mockCitation2 = Object.assign(new Citation(), {
    id: '2',
    exportType: 'publication-ieee',
    value: 'IEEE citation text',
  });

  const boxProviderStub = {
    shortname: 'citations',
    collapsed: false,
    header: 'citations',
  };

  const itemProviderStub = Object.assign(new Item(), {
    id: 'item-1',
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
      declarations: [CitationsComponent, MarkdownDirective],
      imports: [
        CommonModule,
        TranslateModule.forRoot(),
        NgbNavModule,
      ],
      providers: [
        { provide: 'boxProvider', useValue: boxProviderStub },
        { provide: 'itemProvider', useValue: itemProviderStub },
        { provide: ItemAvailableCitationsService, useValue: citationServiceStub },
        { provide: MathService, useValue: { ready: () => of(false), render: () => Promise.resolve() } },
        { provide: NotificationsService, useValue: notificationsServiceStub },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CitationsComponent);
    component = fixture.componentInstance;
  });

  describe('with citations', () => {

    beforeEach(async () => {
      citationServiceStub.getAllAvailableCitations.and.returnValue(of([
        mockCitation1,
        mockCitation2,
      ]));

      fixture.detectChanges();

      const navLinks = fixture.debugElement.queryAll(By.css('.nav-tabs a'));
      navLinks[0].nativeElement.click();
      await fixture.whenStable();
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

    it('should display citation content without tab selection', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const citationTexts = fixture.debugElement.queryAll(By.css('.citation-text'));
      expect(citationTexts.length).toBeGreaterThan(0);
      expect(citationTexts[0].nativeElement.textContent).toContain('APA citation text');
    });

    it('should copy citation text and show success notification', fakeAsync(() => {
      const originalClipboard = navigator.clipboard;
      const fakeClipboard = { writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve()) };
      Object.defineProperty(navigator, 'clipboard', { value: fakeClipboard, configurable: true });
      const copyButtons = fixture.debugElement.queryAll(By.css('.citation-copy-btn'));
      expect(copyButtons.length).toBeGreaterThan(0);
      copyButtons[0].nativeElement.click();
      tick();
      expect(fakeClipboard.writeText).toHaveBeenCalledWith('APA citation text');
      expect(notificationsServiceStub.success).toHaveBeenCalled();
      Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
    }));

    it('should show error notification when copy fails', fakeAsync(() => {
      const originalClipboard = navigator.clipboard;
      const fakeClipboard = { writeText: jasmine.createSpy('writeText').and.returnValue(Promise.reject('error')) };
      Object.defineProperty(navigator, 'clipboard', { value: fakeClipboard, configurable: true });
      const copyButtons = fixture.debugElement.queryAll(By.css('.citation-copy-btn'));
      expect(copyButtons.length).toBeGreaterThan(0);
      copyButtons[0].nativeElement.click();
      tick();
      expect(notificationsServiceStub.error).toHaveBeenCalled();
      Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
    }));

    it('should show error notification when clipboard is unavailable', fakeAsync(() => {
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      });
      const copyButtons = fixture.debugElement.queryAll(By.css('.citation-copy-btn'));
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
