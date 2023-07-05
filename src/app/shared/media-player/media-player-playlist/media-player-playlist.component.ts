import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, mergeMap, tap, toArray } from 'rxjs/operators';

import { BitstreamDataService, MetadataFilter } from '../../../core/data/bitstream-data.service';
import { FindListOptions } from '../../../core/data/find-list-options.model';
import { followLink } from '../../utils/follow-link-config.model';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { RemoteData } from '../../../core/data/remote-data';
import { buildPaginatedList, PaginatedList } from '../../../core/data/paginated-list.model';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { BitstreamFormat } from '../../../core/shared/bitstream-format.model';
import { MediaViewerItem } from '../../../core/shared/media-viewer-item.model';
import { isEmpty } from '../../empty.util';

export interface PlaylistSelectedVideo {
  item: MediaViewerItem,
  index: number
}

@Component({
  selector: 'ds-media-player-playlist',
  templateUrl: './media-player-playlist.component.html',
  styleUrls: ['./media-player-playlist.component.scss']
})
export class MediaPlayerPlaylistComponent implements OnInit {

  /**
   * The item uuid
   */
  @Input() itemUUID: string;

  /**
   * If given, the uuid of the bitstream to start playing
   */
  @Input() startUUID: string;

  /**
   * Path to alt image
   */
  ALT_IMAGE = 'assets/images/replacement_image.svg';

  /**
   * If the list has more elements to load
   */
  hasMoreElements = false;

  /**
   * The list of MediaViewerItem to show in the playlist
   */
  mediaViewerItemList$: BehaviorSubject<MediaViewerItem[]> = new BehaviorSubject<MediaViewerItem[]>([]);

  /**
   * Pagination configuration object
   */
  pageOptions: FindListOptions;

  /**
   * The current selected Bitstream
   */
  selectedItem: MediaViewerItem;

  /**
   * An event emitted when a playlist element is selected
   */
  @Output() selectItem: EventEmitter<PlaylistSelectedVideo> = new EventEmitter<PlaylistSelectedVideo>();

  constructor(protected bitstreamDataService: BitstreamDataService) {
  }

  ngOnInit(): void {
    this.pageOptions = {
      elementsPerPage: 8,
      currentPage: 1
    };
    this.retrieveBitstreams().subscribe((list: MediaViewerItem[]) => {
      if (isEmpty(this.selectedItem) && isEmpty(this.startUUID)) {
        this.selectedItem = list[0];
        this.emitSelectItem(this.selectedItem, 0);
      }
      this.mediaViewerItemList$.next([...this.mediaViewerItemList$.value, ...list]);
    });
  }

  /**
   * Retrieve more playlist element on scroll
   */
  onScrollDown() {
    if (this.hasMoreElements) {
      this.pageOptions.currentPage++;
      this.retrieveBitstreams();
    }
  }

  private retrieveBitstreams(): Observable<MediaViewerItem[]> {
    const filters: MetadataFilter[] = [{
      metadataName: 'bitstream.category',
      metadataValue: 'media'
    }];

    return this.bitstreamDataService.findShowableBitstreamsByItem(
      this.itemUUID,
      'ORIGINAL',
      filters,
      this.pageOptions,
      true,
      true,
      followLink('thumbnail'),
      followLink('format')
    ).pipe(
      getFirstCompletedRemoteData(),
      map((response: RemoteData<PaginatedList<Bitstream>>) => {
        return response.hasSucceeded ? response.payload : buildPaginatedList(null, []);
      }),
      mergeMap((bitstreamList: PaginatedList<Bitstream>) => {
        this.hasMoreElements = this.pageOptions.currentPage !== bitstreamList?.pageInfo?.totalPages;
        return bitstreamList.page;
      }),
      mergeMap((bitstream: Bitstream) => this.createMediaViewerItem(bitstream)),
      toArray(),
      tap(console.log)
    );
  }

  private createMediaViewerItem(bitstream: Bitstream): Observable<MediaViewerItem> {

    const format$: Observable<BitstreamFormat> = bitstream.format.pipe(
      getFirstCompletedRemoteData(),
      map((formatRD: RemoteData<BitstreamFormat>) => formatRD.hasSucceeded ? formatRD.payload : null)
    );
    const thumbnail$: Observable<Bitstream> = bitstream.thumbnail.pipe(
      getFirstCompletedRemoteData(),
      map((thumbnailRD: RemoteData<Bitstream>) => thumbnailRD.hasSucceeded ? thumbnailRD.payload : null)
    );

    return combineLatest([format$, thumbnail$]).pipe(
      map(([format, thumbnail]) => {
        const mediaItem = new MediaViewerItem();
        mediaItem.bitstream = bitstream;
        mediaItem.name = bitstream.firstMetadataValue('dc.title');
        mediaItem.format = format.mimetype.split('/')[0];
        mediaItem.formatDescription = format.description;
        mediaItem.thumbnail = thumbnail ? thumbnail._links.content.href : null;
        mediaItem.manifestUrl = bitstream.allMetadataValues('dash.manifest')[0];
        return mediaItem;
      }));

  }

  /**
   * Emit the select event
   *
   * @param item
   * @param index
   */
  emitSelectItem(item: MediaViewerItem, index: number) {
    this.selectedItem = item;
    this.selectItem.emit({ item, index });
  }

}
