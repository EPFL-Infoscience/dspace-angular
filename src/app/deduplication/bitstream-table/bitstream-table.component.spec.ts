import {
  createSuccessfulRemoteDataObject$,
} from '../../shared/remote-data.utils';
import { Item } from '../../core/shared/item.model';
import { TranslateModule } from '@ngx-translate/core';
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
} from '@angular/core/testing';
import { ItemData } from '../interfaces/deduplication-merge.models';
import { BitstreamTableComponent } from './bitstream-table.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Bundle } from '../../core/shared/bundle.model';
import {
  buildPaginatedList,
  PaginatedList,
} from '../../core/data/paginated-list.model';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { Bitstream } from '../../core/shared/bitstream.model';
import { PageInfo } from '../../core/shared/page-info.model';
import { GetBitstreamsPipe } from '../pipes/ds-get-bitstreams.pipe';

describe('BitstreamTableComponent', () => {
  let component: BitstreamTableComponent;
  let fixture: ComponentFixture<BitstreamTableComponent>;
  let de: DebugElement;
  const bitstream1 = Object.assign(new Bitstream(), {
    id: 'bitstream1',
    uuid: 'bitstream1',
    checkSum: {
      value: 'checkSum-value',
    },
    metadata: {
      'dc.description': [
        {
          value: 'Bitstream description',
        },
      ],
      'dc.title': [
        {
          value: 'Bitstream title',
        },
      ],
    },
    _links: {
      self: { href: 'bitstream-selflink' },
      content: { href: 'content-link' },
    },
  });

  const bitstreamPL: PaginatedList<Bitstream> = createPaginatedList([
    bitstream1,
  ]);

  const bundle = Object.assign(new Bundle(), {
    id: '0db938b1-586e-465b-942c-40145da3452c',
    uuid: '0db938b1-586e-465b-942c-40145da3452c',
    _links: {
      self: { href: 'bundle1-selflink' },
    },
    metadata: {
      'dc.title': [
        {
          value: 'ORIGINAL',
        },
      ],
    },
    bitstreams: createSuccessfulRemoteDataObject$(bitstreamPL),
  });

  const bundles = createSuccessfulRemoteDataObject$(
    buildPaginatedList(new PageInfo(), [bundle])
  );
  const item = Object.assign(new Item(), {
    uuid: '6d9bbd13-cd04-4965-85e3-0f639c742360',
    bundles: bundles,
  });

  const itemsData: ItemData[] = [
    {
      object: item,
      color: 'blue',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BitstreamTableComponent, GetBitstreamsPipe],
      imports: [TranslateModule.forRoot()],
      providers: [
        GetBitstreamsPipe,
        { provide: ComponentFixtureAutoDetect, useValue: true },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BitstreamTableComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('item table', () => {
    it('should display a table', () => {
      component.itemsToCompare = itemsData;
      fixture.detectChanges();
      expect(de.query(By.css('table'))).toBeTruthy();
    });

    it('should not render download action on preview mode', () => {
      component.previewMode = true;
      fixture.detectChanges();
      expect(de.query(By.css('.download-action'))).toBeNull();
    });

    it('should render download action', () => {
      component.previewMode = false;
      fixture.detectChanges();
      const a = de.query(By.css('a#redirect-0'));
      expect(a).toBeDefined();
    });
  });

  describe('onBitstreamChecked', () => {
    beforeEach(() => {
      spyOn(component, 'onBitstreamChecked');
      component.itemsToCompare = itemsData;
      fixture.detectChanges();
    });

    it('onBitstreamChecked method should have been called', () => {
      component.itemsToCompare = itemsData;
      const checkbox = de.query(By.css('input.checkbox-0'));
      checkbox.nativeElement.click();
      expect(component.onBitstreamChecked).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
