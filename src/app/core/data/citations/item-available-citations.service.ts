import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Citation } from '../../shared/citation.model';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { IdentifiableDataService } from '../base/identifiable-data.service';
import { RequestService } from '../request.service';
import { getAllCompletedRemoteData } from '../../shared/operators';

/**
 * Data service responsible for fetching all the available citations for an item, which are used to display the citations in the item page.
 */
@Injectable()
export class ItemAvailableCitationsService extends IdentifiableDataService<Citation> {
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('items', requestService, rdbService, objectCache, halService, null);
  }

  getAllAvailableCitations(item: string): Observable<Citation[]> {
    const href$ = this.halService
      .getEndpoint(this.linkPath)
      .pipe(map((endpoint: string) => `${endpoint}/${item}/export-types/all`));

    return this.findByHref(href$).pipe(
      getAllCompletedRemoteData(),
      map((remoteData) => this.toCitationArray(remoteData?.payload)),
    );
  }

  private toCitationArray(value: unknown): Citation[] {
    const parsedValue = value as Record<string, string>;

    return Object.entries(parsedValue).map(([uniqueType, citationText]) =>
      Object.assign(new Citation(), {
        exportType: uniqueType,
        value: citationText.trim(),
      }),
    );
  }
}
