import { ChangeDetectorRef, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { CdkTreeModule } from '@angular/cdk/tree';

import { of as observableOf } from 'rxjs';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { provideMockStore } from '@ngrx/store/testing';

import { HierarchyComponent } from './hierarchy.component';
import { VocabularyTreeviewService } from 'src/app/shared/vocabulary-treeview/vocabulary-treeview.service';
import { VocabularyEntryDetail } from 'src/app/core/submission/vocabularies/models/vocabulary-entry-detail.model';
import { TreeviewFlatNode } from 'src/app/shared/vocabulary-treeview/vocabulary-treeview-node.model';
import { VocabularyOptions } from 'src/app/core/submission/vocabularies/models/vocabulary-options.model';
import { AuthTokenInfo } from 'src/app/core/auth/models/auth-token-info.model';
import { authReducer } from 'src/app/core/auth/auth.reducer';
import { storeModuleConfig } from 'src/app/app.reducer';
import { createTestComponent } from 'src/app/shared/testing/utils.test';
import { FormFieldMetadataValueObject } from 'src/app/shared/form/builder/models/form-field-metadata-value.model';
import { PageInfo } from 'src/app/core/shared/page-info.model';
import { VocabularyEntry } from 'src/app/core/submission/vocabularies/models/vocabulary-entry.model';
import { Router } from '@angular/router';
import { RouterStub } from 'src/app/shared/testing/router.stub';
import { NativeWindowRef, NativeWindowService } from 'src/app/core/services/window.service';
import { Item } from 'src/app/core/shared/item.model';
import { CrisLayoutBox } from 'src/app/core/layout/models/box.model';

describe('HierarchyComponent test suite', () => {

  let initialState;
  const testItem = Object.assign(new Item(),
    {
      type: 'item',
      metadata: {
        'dc.title': [{
          'value': 'test item title',
          'language': null,
          'authority': null,
          'confidence': -1,
          'place': 0
        }]
      },
      uuid: 'test-item-uuid',
    }
  );

  const item1 = new VocabularyEntryDetail();
  item1.id = 'node1';
  const item2 = new VocabularyEntryDetail();
  item2.id = 'node2';
  const modalStub = jasmine.createSpyObj('modalStub', ['close']);
  const vocabularyTreeviewServiceStub = jasmine.createSpyObj('VocabularyTreeviewService', {
    initialize: jasmine.createSpy('initialize'),
    getData: jasmine.createSpy('getData'),
    loadMore: jasmine.createSpy('loadMore'),
    loadMoreRoot: jasmine.createSpy('loadMoreRoot'),
    isLoading: jasmine.createSpy('isLoading'),
    searchByQuery: jasmine.createSpy('searchByQuery'),
    restoreNodes: jasmine.createSpy('restoreNodes'),
    cleanTree: jasmine.createSpy('cleanTree'),
  });

  initialState = {
    core: {
      auth: {
        authenticated: true,
        loaded: true,
        blocking: false,
        loading: false,
        authToken: new AuthTokenInfo('test_token'),
        userId: 'testid',
        authMethods: []
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CdkTreeModule,
        StoreModule.forRoot({ auth: authReducer }, storeModuleConfig),
        TranslateModule.forRoot()
      ],
      declarations: [
        HierarchyComponent,
        TestComponent
      ],
      providers: [
        { provide: NativeWindowService, useValue: new NativeWindowRef() },
        { provide: VocabularyTreeviewService, useValue: vocabularyTreeviewServiceStub },
        { provide: NgbActiveModal, useValue: modalStub },
        { provide: Router, useValue: new RouterStub() },
        { provide: 'boxProvider', useValue: CrisLayoutBox },
        { provide: 'itemProvider', useValue: testItem },
        provideMockStore({ initialState }),
        ChangeDetectorRef,
        HierarchyComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents().then(() => {
      vocabularyTreeviewServiceStub.getData.and.returnValue(observableOf([]));
      vocabularyTreeviewServiceStub.isLoading.and.returnValue(observableOf(false));
    });
  }));

  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {

      const html = `
        <ds-vocabulary-treeview [vocabularyOptions]="vocabularyOptions" [preloadLevel]="preloadLevel"></ds-vocabulary-treeview>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
      vocabularyTreeviewServiceStub.getData.and.returnValue(observableOf([]));
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create HierarchyComponent', inject([HierarchyComponent], (app: HierarchyComponent) => {
      expect(app).toBeDefined();
    }));
  });

});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {

  vocabularyOptions: VocabularyOptions = new VocabularyOptions('vocabularyTest', null, null, false);
  preloadLevel = 0;

}
