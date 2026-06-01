import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Citation } from '../../shared/citation.model';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { IdentifiableDataService } from '../base/identifiable-data.service';
import { RequestService } from '../request.service';

/**
 * Data service responsible for fetching a specific export type for an item, which is used to display the corresponding citation in the item page when an export type is selected.
 */
@Injectable()
export class ItemExportTypeService extends IdentifiableDataService<Citation> {

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('items', requestService, rdbService, objectCache, halService, null);
  }

  getExportTypeById(item: string, id: string): Observable<string> {
    const href$ = this.halService.getEndpoint(this.linkPath).pipe(
      map((endpoint: string) => `${endpoint}/${item}/export-types/${id}`),
    );

    return this.findByHref(href$).pipe(
      map((remoteData) => this.extractCitationText(remoteData?.payload)),
    );
  }

  private extractCitationText(payload: unknown): string {
    if (typeof payload === 'string') {
      return payload.trim();
    }

    if (payload && typeof payload === 'object' && 'value' in payload) {
      return (payload as { value?: string }).value?.trim() ?? '';
    }

    return '';
  }
}
