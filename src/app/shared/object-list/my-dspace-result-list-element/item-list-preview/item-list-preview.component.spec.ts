import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule, By } from '@angular/platform-browser';

import { of as observableOf } from 'rxjs';

import { TruncatePipe } from '../../../utils/truncate.pipe';
import { Item } from '../../../../core/shared/item.model';
import { ItemListPreviewComponent } from './item-list-preview.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../mocks/translate-loader.mock';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VarDirective } from '../../../utils/var.directive';
import { APP_CONFIG } from '../../../../../config/app-config.interface';
import { MarkdownDirective } from '../../../utils/markdown.directive';
import { MathService } from '../../../../core/shared/math.service';
import { MathServiceMock } from '../../../testing/math-service.stub';
import { AuthorizationDataService } from '../../../../core/data/feature-authorization/authorization-data.service';
import { AuthorizationDataServiceStub } from '../../../testing/authorization-service.stub';
import { ItemDataService } from '../../../../core/data/item-data.service';
import { createSuccessfulRemoteDataObject$ } from '../../../remote-data.utils';

let component: ItemListPreviewComponent;
let fixture: ComponentFixture<ItemListPreviewComponent>;

const mockItemWithAuthorAndDate: Item = Object.assign(new Item(), {
  bundles: observableOf({}),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just a title'
      }
    ],
    'dc.contributor.author': [
      {
        language: 'en_US',
        value: 'Smith, Donald'
      }
    ],
    'dc.date.issued': [
      {
        language: null,
        value: '2015-06-26'
      }
    ]
  },
  _links: {
    self: {}
  }
});
const mockItemWithoutAuthorAndDate: Item = Object.assign(new Item(), {
  bundles: observableOf({}),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title'
      }
    ],
    'dc.type': [
      {
        language: null,
        value: 'Article'
      }
    ]
  },
  _links: {
    self: {}
  }
});
const mockItemWithEntityType: Item = Object.assign(new Item(), {
  bundles: observableOf({}),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title'
      }
    ],
    'dspace.entity.type': [
      {
        language: null,
        value: 'Publication'
      }
    ]
  },
  _links: {
    self: {}
  }
});

const environmentUseThumbs = {
  browseBy: {
    showThumbnails: true
  },
  markdown: {
    enabled: false,
    mathjax: false,
  }
};

const enviromentNoThumbs = {
  browseBy: {
    showThumbnails: false
  },
  markdown: {
    enabled: false,
    mathjax: false,
  }
};

const itemService = jasmine.createSpyObj('itemService', {
  findById: createSuccessfulRemoteDataObject$(new Item())
});


describe('ItemListPreviewComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
        NoopAnimationsModule
      ],
      declarations: [ItemListPreviewComponent, MarkdownDirective, TruncatePipe, VarDirective],
      providers: [
        { provide: MathService, useValue: MathServiceMock },
        { provide: 'objectElementProvider', useValue: { mockItemWithAuthorAndDate }},
        { provide: APP_CONFIG, useValue: environmentUseThumbs },
        { provide: AuthorizationDataService, useClass: AuthorizationDataServiceStub },
        { provide: ItemDataService, useValue: itemService },
      ],

      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ItemListPreviewComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemListPreviewComponent);
    component = fixture.componentInstance;

  }));

  beforeEach(() => {
    component.object = { hitHighlights: {} } as any;
  });

  describe('When showThumbnails is true', () => {
    beforeEach(() => {
      component.item = mockItemWithAuthorAndDate;
      fixture.detectChanges();
    });

    it('should show the title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const itemTitle = fixture.debugElement.query(By.css('h3.lead'));
        expect(itemTitle).not.toBeNull();
        expect(itemTitle.nativeElement.innerHTML).toContain(mockItemWithAuthorAndDate.metadata['dc.title'][0].value);
        done();
      });
    });

    it('should add the ds-thumbnail element', () => {
      const thumbnail = fixture.debugElement.query(By.css('ds-thumbnail'));
      expect(thumbnail).toBeTruthy();
    });
  });

  describe('When the item has an author', () => {
    beforeEach(() => {
      component.item = mockItemWithAuthorAndDate;
      fixture.detectChanges();
    });

    it('should show the title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const itemTitle = fixture.debugElement.query(By.css('h3.lead'));
        expect(itemTitle).not.toBeNull();
        expect(itemTitle.nativeElement.innerHTML).toContain(mockItemWithAuthorAndDate.metadata['dc.title'][0].value);
        done();
      });
    });

    it('should show the author paragraph', () => {
      const itemAuthorField = fixture.debugElement.query(By.css('span.item-list-authors'));
      expect(itemAuthorField).not.toBeNull();
    });
  });

  describe('When the item has no author', () => {
    beforeEach(() => {
      component.item = mockItemWithoutAuthorAndDate;
      fixture.detectChanges();
    });

    it('should show the title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const itemTitle = fixture.debugElement.query(By.css('h3.lead'));
        expect(itemTitle).not.toBeNull();
        expect(itemTitle.nativeElement.innerHTML).toContain(mockItemWithoutAuthorAndDate.metadata['dc.title'][0].value);
        done();
      });
    });

    it('should not show the author paragraph', () => {
      const itemAuthorField = fixture.debugElement.query(By.css('span.item-list-authors'));
      expect(itemAuthorField).toBeNull();
    });
  });

  describe('When the item has an issuedate', () => {
    beforeEach(() => {
      component.item = mockItemWithAuthorAndDate;
      fixture.detectChanges();
    });

    it('should show the title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const itemTitle = fixture.debugElement.query(By.css('h3.lead'));
        expect(itemTitle).not.toBeNull();
        expect(itemTitle.nativeElement.innerHTML).toContain(mockItemWithAuthorAndDate.metadata['dc.title'][0].value);
        done();
      });
    });

    it('should show the issuedate span', () => {
      const dateField = fixture.debugElement.query(By.css('span.item-list-date'));
      expect(dateField).not.toBeNull();
    });
  });

  describe('When the item has no issuedate', () => {
    beforeEach(() => {
      component.item = mockItemWithoutAuthorAndDate;
      fixture.detectChanges();
    });

    it('should show the title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const itemTitle = fixture.debugElement.query(By.css('h3.lead'));
        expect(itemTitle).not.toBeNull();
        expect(itemTitle.nativeElement.innerHTML).toContain(mockItemWithoutAuthorAndDate.metadata['dc.title'][0].value);
        done();
      });
    });

    it('should show the issuedate empty placeholder', () => {
      const dateField = fixture.debugElement.query(By.css('span.item-list-date'));
      expect(dateField).not.toBeNull();
    });
  });

  describe('When the item has an entity type', () => {
    beforeEach(() => {
      component.item = mockItemWithEntityType;
      fixture.detectChanges();
    });

    it('should show the title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const itemTitle = fixture.debugElement.query(By.css('h3.lead'));
        expect(itemTitle).not.toBeNull();
        expect(itemTitle.nativeElement.innerHTML).toContain(mockItemWithEntityType.metadata['dc.title'][0].value);
        done();
      });
    });

    it('should show the badges', () => {
      const entityField = fixture.debugElement.query(By.css('ds-themed-badges'));
      expect(entityField).not.toBeNull();
    });
  });
});

describe('ItemListPreviewComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
        NoopAnimationsModule
      ],
      declarations: [ItemListPreviewComponent, MarkdownDirective, TruncatePipe],
      providers: [
        {provide: MathService, useValue: MathServiceMock},
        {provide: 'objectElementProvider', useValue: {mockItemWithAuthorAndDate}},
        {provide: APP_CONFIG, useValue: enviromentNoThumbs},
        { provide: AuthorizationDataService, useClass: AuthorizationDataServiceStub },
        { provide: ItemDataService, useValue: itemService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ItemListPreviewComponent, {
      set: {changeDetection: ChangeDetectionStrategy.Default}
    }).compileComponents();
  }));
  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemListPreviewComponent);
    component = fixture.componentInstance;

  }));

  beforeEach(() => {
    component.object = { hitHighlights: {} } as any;
  });

  describe('When showThumbnails is true', () => {
    beforeEach(() => {
      component.item = mockItemWithAuthorAndDate;
      fixture.detectChanges();
    });

    it('should show the title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const itemTitle = fixture.debugElement.query(By.css('h3.lead'));
        expect(itemTitle).not.toBeNull();
        expect(itemTitle.nativeElement.innerHTML).toContain(mockItemWithAuthorAndDate.metadata['dc.title'][0].value);
        done();
      });
    });

    it('should add the ds-thumbnail element', () => {
      const thumbnail = fixture.debugElement.query(By.css('ds-thumbnail'));
      expect(thumbnail).toBeFalsy();
    });
  });
});
