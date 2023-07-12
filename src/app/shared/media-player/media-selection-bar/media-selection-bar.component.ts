import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BitstreamDataService, MetadataFilter} from '../../../core/data/bitstream-data.service';
import {FindListOptions} from '../../../core/data/find-list-options.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {buildPaginatedList, PaginatedList} from '../../../core/data/paginated-list.model';
import {Bitstream} from '../../../core/shared/bitstream.model';
import {getFirstCompletedRemoteData} from '../../../core/shared/operators';
import {map, mergeMap, tap, toArray} from 'rxjs/operators';
import {followLink} from '../../utils/follow-link-config.model';
import {isNotEmpty} from '../../empty.util';
import {MediaSelectionBarItem} from './media-selection-bar-item.model';

@Component({
  selector: 'ds-media-selection-bar',
  templateUrl: './media-selection-bar.component.html',
  styleUrls: ['./media-selection-bar.component.scss']
})
export class MediaSelectionBarComponent implements OnInit {
  /**
   * The item uuid
   */
  @Input() itemUUID: string;

  /**
   * If given, the uuid of the bitstream to load selection thumbnails
   */
  @Input() startUUID: string;

  /**
   * If the list has more elements to load
   */
  hasMoreElements = false;

  /**
   * Pagination configuration object
   */
  pageOptions: FindListOptions;

  /**
   * The list of MediaSelectionThumbnails to show in the media section bar
   */
  mediaSelectionItemList$: BehaviorSubject<MediaSelectionBarItem[]> = new BehaviorSubject<MediaSelectionBarItem[]>([]);

  /**
   * The bundle name according current itemUUID
   */
  bundleName: string;

  /**
   * The current selected Bitstream
   */
  selectedMediaItem: Bitstream;

  /**
   * An event emitted when a Selection bar element is selected
   */
  @Output() selectItem: EventEmitter<number> = new EventEmitter<number>();

  constructor(protected bitstreamDataService: BitstreamDataService) {
  }
  ngOnInit(): void {
    this.pageOptions = {
      elementsPerPage: 5,
      currentPage: 1
    };
    this.bundleName = 'SCENES-THUMBNAIL-' + this.startUUID;
    console.log('startUUID - ' , this.startUUID);
    console.log('itemUUID - ' , this.itemUUID);
    console.log('bundleName - ' , this.bundleName);

    this.buildSelectionList(isNotEmpty(this.startUUID)).subscribe((list: MediaSelectionBarItem[]) => {
      this.mediaSelectionItemList$.next([...this.mediaSelectionItemList$.value, ...list]);
    });
  }

  /**
   * Retrieve more selection bar element on scroll
   */
  onScrollDown() {
    console.log('scrollDown');
    if (this.hasMoreElements) {
      this.pageOptions.currentPage++;
      this.buildSelectionList(false).subscribe((list: MediaSelectionBarItem[]) => {
        this.mediaSelectionItemList$.next([...this.mediaSelectionItemList$.value, ...list]);
      });
    }
  }

  /**
   * Retrieve bitstream related to the item
   *
   * @param isStartUUIDPresent If true it continues to retrieve the bitstream until the bitstream with startUUID is not found
   * @private
   */
  private retrieveBitstreams(isStartUUIDPresent: boolean): Observable<PaginatedList<Bitstream>> {
    const filters: MetadataFilter[] = [];
    //   metadataName: 'bitstream.category',
    //   metadataValue: 'media'
    // }];
    console.log('start retrieve bitstream');

    return this.bitstreamDataService.findShowableBitstreamsByItem(
      this.itemUUID,
      this.bundleName,
      filters,
      this.pageOptions,
      true,
      true,
      followLink('thumbnail'),
      followLink('format')
    ).pipe(
      tap((data) => console.log('dataRD',data)),
      getFirstCompletedRemoteData(),
      map((response) => {
        return response.hasSucceeded ? response.payload : buildPaginatedList(null, []);
      }),
      tap((data) => console.log('dataR',data)),
      // mergeMap((bitstreamList: PaginatedList<Bitstream>) => {
      //     this.hasMoreElements = this.pageOptions.currentPage !== bitstreamList?.pageInfo?.totalPages;
      //     if (scrollToGivenUUID) {
      //       console.log('123');
      //     } else {
      //       console.log(bitstreamList);
      //       return of(bitstreamList);
      //     }
      //   }
      //       )
    );
   }
    //   map((response: RemoteData<PaginatedList<Bitstream>>) => {
    //     return response.hasSucceeded ? response.payload : buildPaginatedList(null, []);
    //   }),
    //   mergeMap((bitstreamList: PaginatedList<Bitstream>) => {
    //     this.hasMoreElements = this.pageOptions.currentPage !== bitstreamList?.pageInfo?.totalPages;
    //     if (scrollToGivenUUID && isEmpty(this.selectedMediaItem)) {
    //
    //       const bitstreamIndex = findIndex(bitstreamList.page, { uuid: this.startUUID });
    //       if (bitstreamIndex !== -1) {
    //         return this.createMediaViewerItem(bitstreamList.page[bitstreamIndex]).pipe(
    //           map((mediaItem: MediaViewerItem) => {
    //             this.selectedMediaItem = mediaItem;
    //             return bitstreamList;
    //           })
    //         );
    //       } else if (this.hasMoreElements) {
    //         this.pageOptions.currentPage++;
    //         return this.retrieveBitstreams(scrollToGivenUUID).pipe(
    //           map((bitstreamListRec: PaginatedList<Bitstream>) => {
    //             return buildPaginatedList(bitstreamListRec.pageInfo, [...bitstreamList.page, ...bitstreamListRec.page]);
    //           })
    //         );
    //       } else {
    //         return of(bitstreamList);
    //       }
    //     } else {
    //       return of(bitstreamList);
    //     }
    //   })
    // );
  /**
   * Generate a list of Selection items by retrieving the bitstream
   *
   * @param isStartUUIDPresent If true it continues to retrieve the bitstream until the bitstream with startUUID is not found
   * @private
   */
  private buildSelectionList(isStartUUIDPresent: boolean): Observable<MediaSelectionBarItem[]> {
    return this.retrieveBitstreams(isStartUUIDPresent).pipe(
      mergeMap((bitstreamList: PaginatedList<Bitstream>) => {
        return bitstreamList.page;
      }),
      mergeMap((bitstream: Bitstream) => this.createMediaSelectionItem(bitstream)),
      toArray(),
      tap((data) => console.log('build selection list data', data))
    );
  }

  /**
   * Emit the selectItem event
   *
   * @param item
   */
  emitSelectItem(item: MediaSelectionBarItem) {
    console.log('emitSelectItem',item);
    this.selectItem.emit(item.sceneTimestamp);
  }

  /**
   * Create MediaSelectionBarItem
   *
   * @param bitstream
   */

  private createMediaSelectionItem(bitstream: Bitstream): Observable<MediaSelectionBarItem> {
    const selectionBarItem = new MediaSelectionBarItem();
    selectionBarItem.bitstream = bitstream;
    selectionBarItem.thumbnail = bitstream._links.content.href;
    selectionBarItem.sceneTimestamp = Number(bitstream.allMetadataValues('bitstream.scene.timestamp')[0]);
    return of(selectionBarItem);
  }
}
