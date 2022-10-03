import { TranslateModule } from '@ngx-translate/core';
import { DeduplicationItemsService } from './../deduplication-merge/deduplication-items.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  NgbActiveModal,
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';

import { DeduplicationMergeResultComponent } from './deduplication-merge-result.component';
import { DeduplicationStateService } from '../deduplication-state.service';
import { getMockDeduplicationStateService } from '../../shared/mocks/deduplication.mock';
import { MetadataMapObject } from '../interfaces/deduplication-merge.models';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('DeduplicationMergeResultComponent', () => {
  let component: DeduplicationMergeResultComponent;
  let fixture: ComponentFixture<DeduplicationMergeResultComponent>;
  let de: DebugElement;

  const modalStub = jasmine.createSpyObj('activeModal', ['close', 'dismiss']);

  const modalService = {
    open: () => ({ result: new Promise((res, rej) => 'dismiss') }),
    close: () => null,
    dismiss: () => ({ result: new Promise((res, rej) => 'ok') })
  };

  const deduplicationItemsService = jasmine.createSpyObj('DeduplicationItemsService', {
    mergeData: jasmine.createSpy('mergeData'),
  });

  const compareMetadataValues: Map<string, MetadataMapObject[]> = new Map([
    [
      'dc.title',
      [
        {
          value: 'Publication Metadata In Cerif',
          items: [
            {
              color: '#D09000',
              itemHandle: '23456746',
              itemId: 'c64c56a1-4585-4baa-8287-dc49c60ebf70',
              metadataPlace: 0,
              _link:
                'http://localhost:8080/server/api/core/items/c64c56a1-4585-4baa-8287-dc49c60ebf70',
            },
            {
              color: '#40A0A6',
              itemId: '44c28720-2a37-46f0-b7cd-f11f0207b3e6',
              itemHandle: '23456745',
              metadataPlace: 0,
              _link:
                'http://localhost:8080/server/api/core/items/44c28720-2a37-46f0-b7cd-f11f0207b3e6',
            },
          ],
        },
      ],
    ],
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeduplicationMergeResultComponent],
      providers: [
        { provide: NgbActiveModal, useValue: modalStub },
        {
          provide: NgbModal,
          useValue: modalService,
        },
        { provide: DeduplicationItemsService, useValue: deduplicationItemsService },
        {
          provide: DeduplicationStateService,
          useClass: getMockDeduplicationStateService,
        },
      ],
      imports: [NgbModule, TranslateModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationMergeResultComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render bitstream table', () => {
    const bitstreamTable = de.query(By.css('ds-bitstream-table'));
    expect(bitstreamTable).toBeTruthy();
  });

  it('should display an informing message when there is no data to display', () => {
    component.compareMetadataValues = new Map();
    fixture.detectChanges();
    expect(component.compareMetadataValues.size).toEqual(0);

    const element = de.query(By.css('.informing-message'));
    expect(element).toBeTruthy();
    expect(element.nativeElement.innerText).toContain('no-data');
  });

  it('should have data', () => {
    component.compareMetadataValues = compareMetadataValues;
    fixture.detectChanges();
    const element = de.query(By.css('div.metadata-field-0'));

    expect(component.compareMetadataValues.size).toBeGreaterThan(0);
    expect(element.nativeElement.innerText).toBe('dc.title');
  });

  describe('onMerge', () => {
    it('should call onMerge method on click event', () => {
      spyOn(component, 'onMerge');
      const button = de.query(By.css('button.merge-btn'));
      button.nativeElement.click();
      expect(component.onMerge).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
