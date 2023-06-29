import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemExportUrlComponent } from './item-export-url.component';
import { ItemExportFormatService } from '../../../../core/itemexportformat/item-export-format.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../../notifications/notifications.service';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

describe('ItemExportUrlComponent', () => {
  let component: ItemExportUrlComponent;
  let fixture: ComponentFixture<ItemExportUrlComponent>;
  let translateService: TranslateService;

  const itemExportFormatService = jasmine.createSpyObj('ItemExportFormatService', {
    doExportMulti: jasmine.createSpy('doExportMulti')
  });

  const notificationService = jasmine.createSpyObj('NotificationsService', {
    process: jasmine.createSpy('process')
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule.forRoot()],
      declarations: [ItemExportUrlComponent],
      providers: [
        {provide: ItemExportFormatService, useValue: itemExportFormatService},
        {provide: NotificationsService, useValue: notificationService},
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

  it('should create process when button is clicked', function () {
    component.searchOptions$ = of({} as any);
    itemExportFormatService.doExportMulti.and.returnValue(of(1));
    notificationService.process.and.returnValue(undefined);

    const btn = fixture.nativeElement.querySelector('#export-url');
    btn.click();

    expect(itemExportFormatService.doExportMulti).toHaveBeenCalled();
    expect(notificationService.process).toHaveBeenCalledWith('1', 5000, 'bulk-export-url.process.title');
  });
});
