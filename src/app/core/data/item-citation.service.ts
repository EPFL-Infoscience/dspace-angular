import { Injectable } from '@angular/core';
import { Citation } from '../shared/citation.model';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { RequestService } from './request.service';
import { IdentifiableDataService } from './base/identifiable-data.service';
import { Observable } from 'rxjs/internal/Observable';
import { RemoteData } from './remote-data';
import { buildPaginatedList, PaginatedList } from './paginated-list.model';
import { PageInfo } from '../shared/page-info.model';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { dataService } from './base/data-service.decorator';
import { CITATION } from '../shared/citation.resource-type';

const mockExportTypeChicago = Object.assign(new Citation(), {
  id: 'publication-chicago',
  uniqueType: 'publication-chicago',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  molteplicity: 'SINGLE_AND_MULTIPLE',
});

const mockExportTypeMla = Object.assign(new Citation(), {
  id: 'publication-mla',
  uniqueType: 'publication-mla',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  molteplicity: 'SINGLE_AND_MULTIPLE',
});

const mockExportTypeIeee = Object.assign(new Citation(), {
  id: 'publication-ieee',
  uniqueType: 'publication-ieee',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  molteplicity: 'SINGLE_AND_MULTIPLE',
});

const mockCitationApa = Object.assign(new Citation(), {
  id: 'publication-apa',
  uniqueType: 'publication-apa',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  multeplicity: 'SINGLE_AND_MULTIPLE',
  value: '(2026). Book con allegati. http://localhost:4000/handle/123456789/244740',
});

const mockCitationIeee = Object.assign(new Citation(), {
  id: 'publication-ieee',
  uniqueType: 'publication-ieee',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  molteplicity: 'SINGLE_AND_MULTIPLE',
  value: '[1] A. Pusiol, Book con allegati. 2026. [Online]. Available: http://localhost:4000/handle/123456789/244740',
});

const mockCitationChicago = Object.assign(new Citation(), {
  id: 'publication-chicago',
  uniqueType: 'publication-chicago',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  molteplicity: 'SINGLE_AND_MULTIPLE',
  value: '. 2026. Book con allegati. C 2f33. http://localhost:4000/handle/123456789/244740.',
});

const mockCitationMla = Object.assign(new Citation(), {
  id: 'publication-mla',
  uniqueType: 'publication-mla',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  molteplicity: 'SINGLE_AND_MULTIPLE',
  value: '. Book Con Allegati. C 2f33. 2026, http://localhost:4000/handle/123456789/244740.',
});

const mockCitationHarvard = Object.assign(new Citation(), {
  id: 'publication-harvard',
  uniqueType: 'publication-harvard',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  molteplicity: 'SINGLE_AND_MULTIPLE',
  value: '(2026). Book con allegati. <http://localhost:4000/handle/123456789/244740>.',
});

const mockCitationCover = Object.assign(new Citation(), {
  id: 'publication-cover',
  uniqueType: 'publication-cover',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  molteplicity: 'SINGLE_AND_MULTIPLE',
  value: '. Book con allegati [c 2f33] [Internet]. 2026. Available from: http://localhost:4000/handle/123456789/244740',
});

const mockCitationIso690 = Object.assign(new Citation(), {
  id: 'publication-iso690',
  uniqueType: 'publication-iso690',
  mimeType: 'text/plain',
  configuration: ['researchoutputs', 'researchoutputs0a'],
  molteplicity: 'SINGLE_AND_MULTIPLE',
  value: '. 2026. Book con allegati. Online. c_2f33. Available from: http://localhost:4000/handle/123456789/244740',
});

const mockExportTypes$ = createSuccessfulRemoteDataObject$(
  buildPaginatedList(new PageInfo(), [mockExportTypeChicago, mockExportTypeMla, mockExportTypeIeee]),
);

const mockAvailableCitations$ = createSuccessfulRemoteDataObject$(
  buildPaginatedList(new PageInfo(), [
    mockCitationChicago,
    mockCitationMla,
    mockCitationIeee,
    mockCitationHarvard,
    mockCitationApa,
    mockCitationCover,
    mockCitationIso690,
  ]),
);


@Injectable()
@dataService(CITATION)
export class ItemCitationService extends IdentifiableDataService<Citation> {

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('items', requestService, rdbService, objectCache, halService, null);
  }

  /**
   * list the export types that are available for that item (like publication-apa or publication-ieee)
   * @returns
   *
   */
  getAllExportTypes(): Observable<RemoteData<PaginatedList<Citation>>> {
    // const href$ = this.halService.getEndpoint(this.linkPath).pipe(
    //   map((endpoint: string) => `${endpoint}/export-types`),
    // );

    // return this.findListByHref(href$);
    return mockExportTypes$;
  }

  /**
   * return the requested citation for that item
   * @param id id of the citation (e.g. publication-apa or publication-ieee)
   * @returns
   */
  getExportTypeById(id: string): Observable<RemoteData<Citation>> {
    // const href$ = this.halService.getEndpoint(this.linkPath).pipe(
    //   map((endpoint: string) => `${endpoint}/export-types/${id}`),
    // );

    // return this.findByHref(href$);
    switch (id) {
      case 'publication-chicago':
        return createSuccessfulRemoteDataObject$(mockCitationChicago);
      case 'publication-mla':
        return createSuccessfulRemoteDataObject$(mockCitationMla);
      case 'publication-ieee':
        return createSuccessfulRemoteDataObject$(mockCitationIeee);
      case 'publication-harvard':
        return createSuccessfulRemoteDataObject$(mockCitationHarvard);
      case 'publication-apa':
        return createSuccessfulRemoteDataObject$(mockCitationApa);
      case 'publication-cover':
        return createSuccessfulRemoteDataObject$(mockCitationCover);
      case 'publication-iso690':
        return createSuccessfulRemoteDataObject$(mockCitationIso690);
      default:
        return createSuccessfulRemoteDataObject$(null);
    }
  }

  /**
   * List all the available citations for that item
   * @returns
   */
  getAllAvailableCitations(): Observable<RemoteData<PaginatedList<Citation>>> {
    // const href$ = this.halService.getEndpoint(this.linkPath).pipe(
    //   map((endpoint: string) => `${endpoint}/export-types/all`),
    // );

    // return this.findListByHref(href$);
    return mockAvailableCitations$;
  }
}
