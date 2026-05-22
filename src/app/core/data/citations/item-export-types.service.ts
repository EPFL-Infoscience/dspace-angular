import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ItemExportFormat } from '../../itemexportformat/model/item-export-format.model';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { IdentifiableDataService } from '../base/identifiable-data.service';
import { RequestService } from '../request.service';

/**
 * Data service responsible for fetching all the available export types for an item, which are used to display the export options in the item page.
 */
@Injectable()
export class ItemExportTypesService extends IdentifiableDataService<ItemExportFormat> {

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('items', requestService, rdbService, objectCache, halService, null);
  }

  getAllExportTypes(item: string): Observable<ItemExportFormat[]> {
    const href$ = this.halService.getEndpoint(this.linkPath).pipe(
      map((endpoint: string) => `${endpoint}/${item}/export-types`),
    );

    return this.findListByHref(href$).pipe(
      map((remoteData) => remoteData?.payload?.page ?? []),
    );
  }
}
