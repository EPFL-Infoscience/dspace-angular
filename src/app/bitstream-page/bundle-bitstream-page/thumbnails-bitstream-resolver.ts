import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {RemoteData} from '../../core/data/remote-data';
import {Bitstream} from '../../core/shared/bitstream.model';
import {BundleDataService} from '../../core/data/bundle-data.service';
import {Observable} from 'rxjs';
import {PaginatedSearchOptions} from '../../shared/search/models/paginated-search-options.model';
import {PaginationComponentOptions} from '../../shared/pagination/pagination-component-options.model';
import {PaginatedList} from '../../core/data/paginated-list.model';
import {getFirstCompletedRemoteData} from '../../core/shared/operators';
import {map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ThumbnailsBitstreamResolver implements Resolve<any> {
  constructor(protected bundleDataService: BundleDataService) {
  }
  /**
   * Method for resolving a bitstream based on the parameters in the current route
   * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
   * @param {RouterStateSnapshot} state The current RouterStateSnapshot
   * @returns Observable<<RemoteData<Item>> Emits the found bitstream based on the parameters in the current route,
   * or an error if something went wrong
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    console.log('start resolve', route);
    const bundleId = route.params.bundle_uuid;
    const thumbnailId = route.params.thumbnail_id;
    const paginatedOptions = new PaginatedSearchOptions({
      pagination: Object.assign(new PaginationComponentOptions(), { id: thumbnailId , pageSize: 1, currentPage: thumbnailId})});
    return this.bundleDataService.getBitstreams(bundleId, paginatedOptions)
      .pipe(
        getFirstCompletedRemoteData(),
        map((remoteData: RemoteData<PaginatedList<Bitstream>>) => remoteData.payload?.page[0]),
      );
  }
}

