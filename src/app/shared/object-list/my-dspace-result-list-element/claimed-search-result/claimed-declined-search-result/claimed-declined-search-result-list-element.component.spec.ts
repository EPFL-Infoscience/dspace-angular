import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { of as observableOf } from 'rxjs';

import { ClaimedDeclinedSearchResultListElementComponent } from './claimed-declined-search-result-list-element.component';
import { ClaimedDeclinedTaskSearchResult } from '../../../../object-collection/shared/claimed-declined-task-search-result.model';
import { Item } from '../../../../../core/shared/item.model';
import { createSuccessfulRemoteDataObject } from '../../../../remote-data.utils';
import { WorkflowItem } from '../../../../../core/submission/models/workflowitem.model';
import { ClaimedTask } from '../../../../../core/tasks/models/claimed-task-object.model';
import { getMockLinkService } from '../../../../mocks/link-service.mock';
import { VarDirective } from '../../../../utils/var.directive';
import { TruncatableService } from '../../../../truncatable/truncatable.service';
import { LinkService } from '../../../../../core/cache/builders/link.service';
import { DSONameService } from '../../../../../core/breadcrumbs/dso-name.service';
import { DSONameServiceMock } from '../../../../mocks/dso-name.service.mock';
import { APP_CONFIG } from '../../../../../../config/app-config.interface';
import { environment } from '../../../../../../environments/environment';
import { Context } from '../../../../../core/shared/context.model';
import { TranslateModule } from '@ngx-translate/core';
import { mockTruncatableService } from '../../../../mocks/mock-trucatable.service';

let component: ClaimedDeclinedSearchResultListElementComponent;
let fixture: ComponentFixture<ClaimedDeclinedSearchResultListElementComponent>;

const mockResultObject: ClaimedDeclinedTaskSearchResult = new ClaimedDeclinedTaskSearchResult();
mockResultObject.hitHighlights = {};

const item = Object.assign(new Item(), {
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
  }
});
const rdItem = createSuccessfulRemoteDataObject(item);
const workflowitem = Object.assign(new WorkflowItem(), { item: observableOf(rdItem) });
const rdWorkflowitem = createSuccessfulRemoteDataObject(workflowitem);
mockResultObject.indexableObject = Object.assign(new ClaimedTask(), { workflowitem: observableOf(rdWorkflowitem) });
const linkService = getMockLinkService();

describe('ClaimedDeclinedSearchResultListElementComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NoopAnimationsModule,
      ],
      declarations: [ClaimedDeclinedSearchResultListElementComponent, VarDirective],
      providers: [
        { provide: TruncatableService, useValue: mockTruncatableService },
        { provide: LinkService, useValue: linkService },
        { provide: DSONameService, useClass: DSONameServiceMock },
        { provide: APP_CONFIG, useValue: environment }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ClaimedDeclinedSearchResultListElementComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ClaimedDeclinedSearchResultListElementComponent);
    component = fixture.componentInstance;
  }));

  beforeEach(() => {
    component.dso = mockResultObject.indexableObject;
    fixture.detectChanges();
  });

  it('should init workflowitem properly', (done) => {
    component.workflowitemRD$.subscribe((workflowitemRD) => {
      expect(linkService.resolveLinks).toHaveBeenCalledWith(
        component.dso,
        jasmine.objectContaining({ name: 'workflowitem' }),
        jasmine.objectContaining({ name: 'action' })
      );
      expect(workflowitemRD.payload).toEqual(workflowitem);
      done();
    });
  });

  it('should have the correct badge context', () => {
    expect(component.badgeContext).toEqual(Context.MyDSpaceDeclined);
  });

});
