import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitstreamAttachmentComponent } from './bitstream-attachment.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BitstreamDataService } from '../../../../../../../../core/data/bitstream-data.service';
import { TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ItemDataService } from '../../../../../../../../core/data/item-data.service';

describe('BitstreamAttachmentComponent', () => {
  let component: BitstreamAttachmentComponent;
  let itemDataService = { };
  let fixture: ComponentFixture<BitstreamAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BitstreamAttachmentComponent],
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        { provide: 'fieldProvider', useValue: {} },
        { provide: 'itemProvider', useValue: {} },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: 'tabNameProvider', useValue: '' },
        { provide: BitstreamDataService, useValue: {} },
        { provide: TranslateService, useValue: {} },
        { provide: ItemDataService, useValue: itemDataService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BitstreamAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
