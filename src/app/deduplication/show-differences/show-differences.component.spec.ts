import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MetadataValue } from 'src/app/core/shared/metadata.models';
import { ItemsMetadataValues } from '../interfaces/deduplication-differences.models';

import { ShowDifferencesComponent } from './show-differences.component';

describe('ShowDifferencesComponent', () => {
  let component: ShowDifferencesComponent;
  let fixture: ComponentFixture<ShowDifferencesComponent>;
  let de: DebugElement;
  let itemsMetadataValues: ItemsMetadataValues = {
    itemId: '1234-65487-12354-1235',
    value: new MetadataValue(),
    color: 'blue',
  }

  let metadataKey = 'dc.title';

  const modalStub = jasmine.createSpyObj('activeModal', ['close', 'dismiss']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowDifferencesComponent],
      providers: [
        { provide: NgbActiveModal, useValue: modalStub }
      ],
      imports: [
        CommonModule,
        NgbModule,
        TranslateModule.forRoot(),
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowDifferencesComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should init component properly', () => {
    spyOn(component, 'prepareItems');
    component.itemList = Object.assign(new Array<ItemsMetadataValues>(), [
      itemsMetadataValues
    ]);
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.prepareItems).toHaveBeenCalled();
  });

  it('check metadataKey', () => {
    component.metadataKey = metadataKey;
    fixture.detectChanges();
    expect(de.query(By.css('u')).nativeElement.innerText).toEqual(metadataKey);
  });

  afterEach(() => {
    fixture.destroy();
  });
});
