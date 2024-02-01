import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemExportUrlComponent } from './item-export-url.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../../notifications/notifications.service';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

describe('ItemExportUrlComponent', () => {
  let component: ItemExportUrlComponent;
  let fixture: ComponentFixture<ItemExportUrlComponent>;
  let translateService: TranslateService;

  const notificationService = jasmine.createSpyObj('notificationsService', {
    success: jasmine.createSpy('success').and.stub(),
    error: jasmine.createSpy('error')
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule.forRoot()],
      declarations: [ItemExportUrlComponent],
      providers: [
        { provide: NotificationsService, useValue: notificationService },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemExportUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    translateService = TestBed.inject(TranslateService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write to clipboard when button is clicked', function () {
    component.searchOptions$ = of({} as any);
    spyOn(navigator.clipboard, 'writeText');

    const btn = fixture.nativeElement.querySelector('#export-url');
    btn.click();

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
