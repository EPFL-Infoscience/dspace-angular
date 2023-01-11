import { WorkflowItem } from './../../core/submission/models/workflowitem.model';
import { ItemMock } from './../../shared/mocks/item.mock';
import { NoContent } from './../../core/shared/NoContent.model';
import { RequestParam } from './../../core/cache/models/request-param.model';
import { RemoteData } from './../../core/data/remote-data';
import { followLink } from './../../shared/utils/follow-link-config.model';
import { FindListOptions } from './../../core/data/find-list-options.model';
import { SetObject } from './../../core/deduplication/models/set.model';
import { DeduplicationSetsService } from './deduplication-sets.service';
import { WorkflowItemDataService } from './../../core/submission/workflowitem-data.service';
import { SubmissionRestService } from './../../core/submission/submission-rest.service';
import { ItemDataService } from './../../core/data/item-data.service';
import { SubmissionRestServiceStub } from '../../shared/testing/submission-rest-service.stub';
import { Observable, of } from 'rxjs';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { DeduplicationSetsRestService } from '../../core/deduplication/services/deduplication-sets-rest.service';
import { createSuccessfulRemoteDataObject, createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { mockSetObject } from '../../shared/mocks/deduplication.mock';
import { cold } from 'jasmine-marbles';
import { PaginatedList } from '../../core/data/paginated-list.model';

describe('DeduplicationSetsService', () => {
  let service: DeduplicationSetsService;
  let serviceAsAny: any;

  const elementsPerPage = 5;
  const currentPage = 0;
  const signatureId = mockSetObject.signatureId;
  const rule = 'admin';


  const submissionRestServiceStub: any = new SubmissionRestServiceStub();

  const setObjectPL: PaginatedList<SetObject> = createPaginatedList([mockSetObject]);
  const setObjectRD$: Observable<RemoteData<PaginatedList<SetObject>>> = createSuccessfulRemoteDataObject$(setObjectPL);
  const noContent: NoContent = {};

  const deduplicationRestServiceStub: any = {
    getSetsPerSignature: () => setObjectRD$,
    deleteSet: () => createSuccessfulRemoteDataObject$(noContent),
    removeItem: () => createSuccessfulRemoteDataObject$(noContent),
  };

  const itemDataServiceStub: any = {
    delete: () => createSuccessfulRemoteDataObject$(noContent),
  };

  const workflowItemDataServiceStub: any = {
    findByItem: () => createSuccessfulRemoteDataObject$(new WorkflowItem()),
    delete: () => createSuccessfulRemoteDataObject$(noContent)
  };

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      providers: [
        DeduplicationSetsService,
        { provide: DeduplicationSetsRestService, useValue: deduplicationRestServiceStub },
        { provide: ItemDataService, useValue: itemDataServiceStub },
        { provide: SubmissionRestService, useValue: submissionRestServiceStub },
        { provide: WorkflowItemDataService, useValue: workflowItemDataServiceStub },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    service = new DeduplicationSetsService(
      deduplicationRestServiceStub,
      itemDataServiceStub,
      submissionRestServiceStub,
      workflowItemDataServiceStub
    );
    serviceAsAny = service;
  });

  describe('working with sets', () => {
    beforeEach(() => {
      spyOn(serviceAsAny.deduplicationRestService, 'getSetsPerSignature').and.returnValue(setObjectRD$);
      spyOn(serviceAsAny.deduplicationRestService, 'deleteSet').and.returnValue(createSuccessfulRemoteDataObject$(noContent));
      spyOn(serviceAsAny.deduplicationRestService, 'removeItem').and.returnValue(createSuccessfulRemoteDataObject$(noContent));
    });

    it('should proxy the call to getSetsPerSignature', () => {
      const result = service.getSets(elementsPerPage, currentPage, signatureId, rule);
      const findListOptions: FindListOptions = new FindListOptions();
      findListOptions.elementsPerPage = elementsPerPage;
      findListOptions.currentPage = currentPage;
      findListOptions.searchParams = [
        new RequestParam('signature-id', signatureId),
        new RequestParam('haveItems', true)
      ];
      findListOptions.searchParams.push(new RequestParam('rule', rule));

      expect(serviceAsAny.deduplicationRestService.getSetsPerSignature).toHaveBeenCalledWith(findListOptions, followLink('items', {}, followLink('bundles', {}, followLink('bitstreams')), followLink('owningCollection')));

      const expected = cold('(a|)', {
        a: setObjectPL
      });
      expect(result).toBeObservable(expected);
    });

    it('should proxy the call to deleteSet', () => {
      const result = service.deleteSet(mockSetObject.signatureId, mockSetObject.setChecksum);
      expect(serviceAsAny.deduplicationRestService.deleteSet).toHaveBeenCalledWith(mockSetObject.signatureId, mockSetObject.setChecksum);

      const expected = cold('(a|)', {
        a: createSuccessfulRemoteDataObject(noContent)
      });
      expect(result).toBeObservable(expected);
    });

    it('should proxy the call to removeItem from set', () => {
      const result = service.removeItem(signatureId, ItemMock.id, mockSetObject.setChecksum);
      expect(serviceAsAny.deduplicationRestService.removeItem).toHaveBeenCalledWith(signatureId, ItemMock.id, mockSetObject.setChecksum);
    });
  });

  describe('working with the items of the set', () => {
    beforeEach(() => {
      spyOn(serviceAsAny.itemDataService, 'delete').and.returnValue(createSuccessfulRemoteDataObject$(noContent));
     // spyOn(serviceAsAny.submissionRestService, 'deleteById').and.returnValue(of({}));
      spyOn(serviceAsAny.workflowItemDataService, 'findByItem').and.returnValue(createSuccessfulRemoteDataObject$(new WorkflowItem()));
      spyOn(serviceAsAny.workflowItemDataService, 'delete').and.returnValue(createSuccessfulRemoteDataObject$(noContent));
    });

    it('should delete an item', () => {
      const result = service.deleteSetItem(ItemMock.id);
      expect(serviceAsAny.itemDataService.delete).toHaveBeenCalledWith(ItemMock.id);

      const expected = cold('(a|)', {
        a: createSuccessfulRemoteDataObject(noContent)
      });
      expect(result).toBeObservable(expected);
    });

    it('should proxy the call to getSubmissionWorkspaceitem', () => {
      service.getSubmissionWorkspaceitem(ItemMock.id);
      expect(serviceAsAny.submissionRestService.getDataById).toHaveBeenCalled();
    });

    it('should proxy the call to deleteById for a workspace item', () => {
      service.deleteWorkspaceItemById(ItemMock.id);
      expect(serviceAsAny.submissionRestService.deleteById).toHaveBeenCalled();
    });

    it('should proxy the call to getSubmissionWorkflowItems', () => {
      const result = serviceAsAny.getSubmissionWorkflowItems(ItemMock.id);
      expect(serviceAsAny.workflowItemDataService.findByItem).toHaveBeenCalledWith(ItemMock.id);

      const expected = cold('(a|)', {
        a: createSuccessfulRemoteDataObject(new WorkflowItem())
      });
      expect(result).toBeObservable(expected);
    });

    it('should proxy the call to deleteWorkflowItem', () => {
      const result = service.deleteWorkflowItem(ItemMock.id);
      expect(serviceAsAny.workflowItemDataService.delete).toHaveBeenCalledWith(ItemMock.id);

      const expected = cold('(a|)', {
        a: createSuccessfulRemoteDataObject(noContent)
      });
      expect(result).toBeObservable(expected);
    });
  });
});
