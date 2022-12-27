import { ItemMock } from './../../shared/mocks/item.mock';
import { RouterMock } from './../../shared/mocks/router.mock';
import { SubmissionRepeatableFieldsObject } from './../../core/deduplication/models/submission-repeatable-fields.model';
import { itemsToCompare } from './../../shared/mocks/deduplication.mock';
import { ConfigurationProperty } from './../../core/shared/configuration-property.model';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationDataService } from './../../core/data/configuration-data.service';
import { DeduplicationItemsService } from './deduplication-items.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from '../../core/services/cookie.service';
import { CookieServiceMock } from '../../shared/mocks/cookie.service.mock';

import { DeduplicationMergeComponent } from './deduplication-merge.component';
import { GetBitstreamsPipe } from './../pipes/ds-get-bitstreams.pipe';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MockActivatedRoute } from '../../shared/mocks/active-router.mock';
import { ChangeDetectorRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RemoteData } from '../../core/data/remote-data';
import { By } from '@angular/platform-browser';
import { isEqual } from 'lodash';
import { hasValue } from '../../shared/empty.util';

describe('DeduplicationMergeComponent', () => {
  let component: DeduplicationMergeComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<DeduplicationMergeComponent>;
  const cookieService = new CookieServiceMock();
  const modalStub = {
    open: () => ({ result: new Promise((res, rej) => 'ok') }),
    close: () => null,
    dismiss: () => null
  };

  const configurationDataService = {
    findByPropertyName(): Observable<RemoteData<ConfigurationProperty>> {
      const collectionProperty = new ConfigurationProperty();
      collectionProperty.name = 'merge.excluded-metadata';
      collectionProperty.values = [];
      return createSuccessfulRemoteDataObject$(collectionProperty);
    }
  };

  const mockCdRef = Object.assign({
    detectChanges: () => fixture.detectChanges()
  });

  const deduplicationItemsService = jasmine.createSpyObj('deduplicationItemsService', {
    mergeData: jasmine.createSpy('mergeData'),
    getRepeatableFields: jasmine.createSpy('getRepeatableFields'),
    getItemData: jasmine.createSpy('getItemData'),
    getItemByHref: jasmine.createSpy('getItemByHref'),
  });

  const params: Params = {
    signatureId: 'title',
    setChecksum: 'd4b9185f91391c0574f4c3dbdd6fa7d3'
  };

  const route = new MockActivatedRoute(params);

  const itemsPerset: string[] = ['231d6608-0847-4f4b-ac5f-c6058ce6a73d', '2c6a5994-ffd5-44c3-941c-baca3afcc9b0'];
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeduplicationMergeComponent],
      providers: [
        { provide: CookieService, useValue: cookieService },
        { provide: DeduplicationItemsService, useValue: deduplicationItemsService },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: ActivatedRoute, useValue: route },
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: new RouterMock() },
        { provide: Location, useValue: location },
        { provide: ChangeDetectorRef, useValue: mockCdRef },
        { provide: NgbModal, useValue: modalStub },
        GetBitstreamsPipe
      ],
      imports: [
        TranslateModule.forRoot(),
        NgbModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationMergeComponent);
    component = fixture.componentInstance;
    compAsAny = component;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialize component', () => {
    beforeEach(() => {
      cookieService.set(`items-to-compare-${(route.snapshot.params as any).setChecksum}`, JSON.stringify(itemsPerset));
      compAsAny.storedItemList = [...itemsPerset];
      spyOn(compAsAny, 'getExcludedMetadata');
      spyOn(compAsAny, 'getItemsData').and.callThrough();
      spyOn(component, 'getData').and.callThrough();
      compAsAny.deduplicationItemsService.getItemData.and.returnValue(of(itemsToCompare[0].object));
      compAsAny.deduplicationItemsService.getRepeatableFields.and.returnValue(of(Object.assign(new SubmissionRepeatableFieldsObject(), {
        repeatableFields: []
      })));
      fixture.detectChanges();
    });

    it('should get value from cookie service', () => {
      expect((route.snapshot.params as any).setChecksum).not.toBeNull();
      const storageValues = compAsAny.cookieService.get(
        `items-to-compare-${(route.snapshot.params as any).setChecksum}`
      );
      expect(storageValues).not.toBeUndefined();
    });

    it('should init component properly', () => {
      component.ngOnInit();
      fixture.detectChanges();
      expect(compAsAny.getExcludedMetadata).toHaveBeenCalled();
    });

    it('should calculate metadata to display', () => {
      component.getData(itemsPerset[0]);
      expect(compAsAny.deduplicationItemsService.getItemData).toHaveBeenCalled();
    });

    it('should display a message when no data', () => {
      const h4 = fixture.debugElement.query(By.css('h4'));
      expect(h4.nativeElement.innerText).toEqual('deduplication.merge.message.no-data');
    });

    describe('should display data', () => {
      beforeEach(() => {
        spyOn(component, 'showDiff');
        spyOn(component, 'removeAllSelections').and.callThrough();
        spyOn(component, 'isValueChecked').and.callThrough();
        spyOn(component, 'uncheckValue').and.callThrough();
        spyOn(compAsAny, 'getNestedMetadataValueByKey').and.callThrough();
        component.itemsToCompare = [...itemsToCompare];
        compAsAny.getItemsData();
        fixture.detectChanges();
      });

      it('should display data tables', () => {
        const itemTable = fixture.debugElement.query(By.css('ds-items-table'));
        const bitstreamTable = fixture.debugElement.query(By.css('ds-bitstream-table'));

        expect(itemTable).not.toBeNull();
        expect(bitstreamTable).not.toBeNull();
      });

      it('should display all the metadata keys in accordions', () => {
        const accordions = fixture.debugElement.queryAll(By.css('ngb-accordion'));
        expect(accordions.length).toEqual(component.compareMetadataValues.size);
      });

      it('should open modal to show diffs', () => {
        spyOn(compAsAny.modalService, 'open').and.returnValue({ result: new Promise((res, rej) => 'ok') });
        const button = fixture.debugElement.query(By.css('button.show-diff-btn'));
        button.nativeElement.click();
        expect(component.showDiff).toHaveBeenCalled();
      });

      it('should select metadata values', () => {
        const element = fixture.debugElement.query(By.css('.custom-radio > input.custom-control-input'));
        element.nativeElement.value = '';
        const key = element.nativeElement.name;
        const items = component.compareMetadataValues.get(key);
        expect(component.isValueChecked).toHaveBeenCalled();
        expect(component.isValueChecked).toHaveBeenCalledWith(key, items.find(x => x.value).items);
        const isChecked = component.isValueChecked(key, items.find(x => x.value).items);
        expect(isChecked).toBeTrue();
      });

      it('should deselect metadata value', () => {
        const element = fixture.debugElement.query(By.css('.custom-radio > input.custom-control-input'));
        const key = element.nativeElement.name;
        element.nativeElement.click();
        const items = component.compareMetadataValues.get(key);
        expect(component.uncheckValue).toHaveBeenCalled();
        expect(component.uncheckValue).toHaveBeenCalledWith(key, items.find(x => x.value).items, 'single');

        component.uncheckValue(key, items.find(x => x.value).items, 'single');
        const metadata = compAsAny.mergedMetadataFields
          .find((x) => isEqual(x.metadataField, key));

        expect(metadata.sources).toEqual([]);
      });

      it('should delete all the selections', () => {
        const element = fixture.debugElement.query(By.css('button.delete-btn'));
        element.nativeElement.click();
        const key = element.parent.parent.children[0].nativeElement.innerText;
        const res = compAsAny.mergedMetadataFields.find((x) =>
          isEqual(x.metadataField, key)
        ).sources = [];
        expect(component.removeAllSelections).toHaveBeenCalled();
        expect(res).toEqual([]);
      });

      it('should calculate all metadata values and their nested metadata values', () => {
        component.calculateNewMetadataValues(ItemMock, 'dc.type');
        expect(component.compareMetadataValues.size).toBeGreaterThan(0);
        expect(compAsAny.getNestedMetadataValueByKey).toHaveBeenCalled();
        expect(component.compareMetadataValues.get('dc.type').every(x => !hasValue(x.nestedMetadataValues))).toBeTrue();
        expect(component.compareMetadataValues.get('dc.contributor.author').every(x => hasValue(x.nestedMetadataValues))).toBeTrue();
      });
    });
  });

  afterAll(() => {
    fixture.destroy();
  });
});
