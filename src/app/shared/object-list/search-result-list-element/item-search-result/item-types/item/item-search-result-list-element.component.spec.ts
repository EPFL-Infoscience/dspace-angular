import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule, By } from '@angular/platform-browser';
import { of as observableOf } from 'rxjs';
import { ItemSearchResultListElementComponent } from './item-search-result-list-element.component';
import { Item } from '../../../../../../core/shared/item.model';
import { TruncatePipe } from '../../../../../utils/truncate.pipe';
import { TruncatableService } from '../../../../../truncatable/truncatable.service';
import { ItemSearchResult } from '../../../../../object-collection/shared/item-search-result.model';
import { DSONameService } from '../../../../../../core/breadcrumbs/dso-name.service';
import { DSONameServiceMock, UNDEFINED_NAME } from '../../../../../mocks/dso-name.service.mock';
import { VarDirective } from '../../../../../utils/var.directive';
import { APP_CONFIG } from '../../../../../../../config/app-config.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownDirective } from '../../../../../utils/markdown.directive';
import { MathService } from '../../../../../../core/shared/math.service';
import { MathServiceMock } from '../../../../../testing/math-service.stub';


let publicationListElementComponent: ItemSearchResultListElementComponent;
let fixture: ComponentFixture<ItemSearchResultListElementComponent>;
const dcTitle = 'This is just another <em>title</em>';
const mockItemWithMetadata: ItemSearchResult = Object.assign(new ItemSearchResult(), {
  hitHighlights: {
    'dc.title': [{
      value: dcTitle
    }],
  },
  indexableObject:
    Object.assign(new Item(), {
      bundles: observableOf({}),
      metadata: {
        'dc.title': [
          {
            language: 'en_US',
            value: dcTitle
          }
        ],
        'dc.contributor.author': [
          {
            language: 'en_US',
            value: 'Smith, Donald'
          }
        ],
        'dc.publisher': [
          {
            language: 'en_US',
            value: 'a publisher'
          }
        ],
        'dc.date.issued': [
          {
            language: 'en_US',
            value: '2015-06-26'
          }
        ],
        'dc.description.abstract': [
          {
            language: 'en_US',
            value: 'This is the abstract'
          }
        ]
      }
    })
});
const mockItemWithoutMetadata: ItemSearchResult = Object.assign(new ItemSearchResult(), {
  indexableObject:
    Object.assign(new Item(), {
      bundles: observableOf({}),
      metadata: {}
    })
});
const mockPerson: ItemSearchResult = Object.assign(new ItemSearchResult(), {
  hitHighlights: {
    'person.familyName': [{
      value: '<em>Michel</em>'
    }],
  },
  indexableObject:
    Object.assign(new Item(), {
      bundles: observableOf({}),
      entityType: 'Person',
      metadata: {
        'dc.title': [
          {
            language: 'en_US',
            value: 'This is just another title'
          }
        ],
        'dc.contributor.author': [
          {
            language: 'en_US',
            value: 'Smith, Donald'
          }
        ],
        'dc.publisher': [
          {
            language: 'en_US',
            value: 'a publisher'
          }
        ],
        'dc.date.issued': [
          {
            language: 'en_US',
            value: '2015-06-26'
          }
        ],
        'dc.description.abstract': [
          {
            language: 'en_US',
            value: 'This is the abstract'
          }
        ],
        'person.familyName': [
          {
            value: 'Michel'
          }
        ],
        'dspace.entity.type': [
          {
            value: 'Person'
          }
        ]
      }
    })
});
const mockOrgUnit: ItemSearchResult = Object.assign(new ItemSearchResult(), {
  hitHighlights: {
    'organization.legalName': [{
      value: '<em>Science</em>'
    }],
  },
  indexableObject:
    Object.assign(new Item(), {
      bundles: observableOf({}),
      entityType: 'OrgUnit',
      metadata: {
        'dc.title': [
          {
            language: 'en_US',
            value: 'This is just another title'
          }
        ],
        'dc.contributor.author': [
          {
            language: 'en_US',
            value: 'Smith, Donald'
          }
        ],
        'dc.publisher': [
          {
            language: 'en_US',
            value: 'a publisher'
          }
        ],
        'dc.date.issued': [
          {
            language: 'en_US',
            value: '2015-06-26'
          }
        ],
        'dc.description.abstract': [
          {
            language: 'en_US',
            value: 'This is the abstract'
          }
        ],
        'organization.legalName': [
          {
            value: 'Science'
          }
        ],
        'dspace.entity.type': [
          {
            value: 'OrgUnit'
          }
        ]
      }
    })
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

describe('ItemSearchResultListElementComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, TranslateModule.forRoot()],
      declarations: [ItemSearchResultListElementComponent, MarkdownDirective, TruncatePipe, VarDirective],
      providers: [
        { provide: TruncatableService, useValue: {} },
        { provide: DSONameService, useClass: DSONameServiceMock },
        { provide: APP_CONFIG, useValue: environmentUseThumbs },
        { provide: MathService, useValue: MathServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ItemSearchResultListElementComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemSearchResultListElementComponent);
    publicationListElementComponent = fixture.componentInstance;

  }));

  describe('with environment.browseBy.showThumbnails set to true', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    }));

    it('should set showThumbnails to true', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(publicationListElementComponent.showThumbnails).toBeTrue();
        done();
      });
    });

    it('should add ds-thumbnail element', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const thumbnailElement = fixture.debugElement.query(By.css('ds-thumbnail'));
        expect(thumbnailElement).toBeTruthy();
        done();
      });
    });
  });

  describe('When the item has an author', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    }));

    it('should show the author paragraph', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const itemAuthorField = fixture.debugElement.query(By.css('span.item-list-authors'));
        expect(itemAuthorField).not.toBeNull();
        done();
      });
    });
  });

  describe('When the item has no author', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    }));

    it('should not show the author paragraph', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const itemAuthorField = fixture.debugElement.query(By.css('span.item-list-authors'));
        expect(itemAuthorField).toBeNull();
        done();
      });
    });
  });

  describe('When the item has a publisher', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    }));

    it('should show the publisher span', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const publisherField = fixture.debugElement.query(By.css('span.item-list-publisher'));
        expect(publisherField).not.toBeNull();
        done();
      });
    });
  });

  describe('When the item has no publisher', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    }));

    it('should not show the publisher span', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const publisherField = fixture.debugElement.query(By.css('span.item-list-publisher'));
        expect(publisherField).toBeNull();
        done();
      });
    });
  });

  describe('When the item has an issuedate', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    }));

    it('should show the issuedate span', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const dateField = fixture.debugElement.query(By.css('span.item-list-date'));
        expect(dateField).not.toBeNull();
        done();
      });
    });
  });

  describe('When the item has no issuedate', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    }));

    it('should not show the issuedate span', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const dateField = fixture.debugElement.query(By.css('span.item-list-date'));
        expect(dateField).toBeNull();
        done();
      });
    });
  });

  describe('When the item has an abstract', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    }));

    it('should show the abstract span', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const abstractField = fixture.debugElement.query(By.css('div.item-list-abstract'));
        expect(abstractField).not.toBeNull();
        done();
      });
    });
  });

  describe('When the item has no abstract', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    }));

    it('should not show the abstract span', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const abstractField = fixture.debugElement.query(By.css('div.item-list-abstract'));
        expect(abstractField).toBeNull();
        done();
      });
    });
  });

  describe('When the item has title', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    }));

    it('should show highlighted title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const titleField = fixture.debugElement.query(By.css('.item-list-title'));
        expect(titleField.nativeNode.innerHTML).toEqual(dcTitle);
        done();
      });
    });
  });

  describe('When the item is Person and has title', () => {
    beforeEach(waitForAsync(() => {
      publicationListElementComponent.object = mockPerson;
      fixture.detectChanges();
    }));

    it('should show highlighted title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const titleField = fixture.debugElement.query(By.css('.item-list-title'));
        expect(titleField.nativeNode.innerHTML).toEqual('<em>Michel</em>');
        done();
      });
    });
  });

  describe('When the item is orgUnit and has title', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockOrgUnit;
      fixture.detectChanges();
    });

    it('should show highlighted title', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const titleField = fixture.debugElement.query(By.css('.item-list-title'));
        expect(titleField.nativeNode.innerHTML).toEqual('<em>Science</em>');
        done();
      });
    });
  });

  describe('When the item has no title', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    });

    it('should show the fallback untitled translation', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const titleField = fixture.debugElement.query(By.css('.item-list-title'));
        expect(titleField.nativeElement.textContent.trim()).toEqual(UNDEFINED_NAME);
        done();
      });
    });
  });
});

describe('ItemSearchResultListElementComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, TranslateModule.forRoot()],
      declarations: [ItemSearchResultListElementComponent, MarkdownDirective, TruncatePipe],
      providers: [
        {provide: TruncatableService, useValue: {}},
        {provide: DSONameService, useClass: DSONameServiceMock},
        { provide: APP_CONFIG, useValue: enviromentNoThumbs },
        { provide: MathService, useValue: MathServiceMock },
      ],

      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ItemSearchResultListElementComponent, {
      set: {changeDetection: ChangeDetectionStrategy.Default}
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemSearchResultListElementComponent);
    publicationListElementComponent = fixture.componentInstance;
  }));

  describe('with environment.browseBy.showThumbnails set to false', () => {
    beforeEach(() => {

      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });

    it('should not add ds-thumbnail element', (done) => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const thumbnailElement = fixture.debugElement.query(By.css('ds-thumbnail'));
        expect(thumbnailElement).toBeFalsy();
        done();
      });
    });
  });
});
