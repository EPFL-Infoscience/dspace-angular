import { Injectable } from '@angular/core';
import { Citation } from '../shared/citation.model';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { RequestService } from './request.service';
import { IdentifiableDataService } from './base/identifiable-data.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { RemoteData } from './remote-data';
import { PaginatedList } from './paginated-list.model';


@Injectable({
  providedIn: 'root',
})
export abstract class ItemCitationService extends IdentifiableDataService<Citation> {

  constructor(
    protected linkPath,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super(linkPath, requestService, rdbService, objectCache, halService, null);
  }

  /**
   * list the export types that are available for that item (like publication-apa or publication-ieee)
   * @returns
   *
   */
  getAllExportTypes(): Observable<RemoteData<PaginatedList<Citation>>> {
    const href$ = this.halService.getEndpoint(this.linkPath).pipe(
      map((endpoint: string) => `${endpoint}/export-types`),
    );

    return this.findListByHref(href$);
  }

  /**
   * return the requested citation for that item
   * @param id id of the citation (e.g. publication-apa or publication-ieee)
   * @returns
   */
  getExportTypeById(id: string): Observable<RemoteData<Citation>> {
    const href$ = this.halService.getEndpoint(this.linkPath).pipe(
      map((endpoint: string) => `${endpoint}/export-types/${id}`),
    );

    return this.findByHref(href$);
  }

  /**
   * List all the available citations for that item
   * @returns
   */
  getAllAvailableCitations(): Observable<RemoteData<PaginatedList<Citation>>> {
    const href$ = this.halService.getEndpoint(this.linkPath).pipe(
      map((endpoint: string) => `${endpoint}/export-types/all`),
    );

    return this.findListByHref(href$);
  }
}
