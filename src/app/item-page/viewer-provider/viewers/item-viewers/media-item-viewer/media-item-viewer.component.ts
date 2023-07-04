import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {BaseItemViewerComponent} from '../base-item-viewer.component';
import {BehaviorSubject, Observable} from 'rxjs';
import {MediaViewerItem} from '../../../../../core/shared/media-viewer-item.model';
import {
  getFirstSucceededRemoteDataPayload,
  getFirstSucceededRemoteWithNotEmptyData
} from '../../../../../core/shared/operators';
import {RemoteData} from '../../../../../core/data/remote-data';
import {PaginatedList} from '../../../../../core/data/paginated-list.model';
import {Bitstream} from '../../../../../core/shared/bitstream.model';
import {followLink} from '../../../../../shared/utils/follow-link-config.model';
import {hasValue} from '../../../../../shared/empty.util';
import {BitstreamFormat} from '../../../../../core/shared/bitstream-format.model';
import {BitstreamDataService} from '../../../../../core/data/bitstream-data.service';
import {filter, map, take, tap} from 'rxjs/operators';
import {FindListOptions} from '../../../../../core/data/find-list-options.model';

@Component({
  selector: 'ds-media-item-viewer',
  templateUrl: './media-item-viewer.component.html',
  styleUrls: ['./media-item-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaItemViewerComponent extends BaseItemViewerComponent implements OnInit {

  mediaList$: BehaviorSubject<MediaViewerItem[]>;
  isLoading: boolean;
  private currentPage = 1;
  public hasNextPage = true;

  constructor(
    protected bitstreamDataService: BitstreamDataService
  ) {
    super();
  }

  ngOnInit(): void {
    this.mediaList$ = new BehaviorSubject([]);
    this.isLoading = true;
    this.loadPlaylistData(this.currentPage);
    }

  loadPlaylistData(currentPage: number){
    this.loadRemoteData('ORIGINAL', currentPage).pipe(
      map((remoteData: RemoteData<PaginatedList<Bitstream>> ) => remoteData.payload?.page),
      map((bitsreams) => bitsreams?.filter((bitstream) => bitstream.metadata['bitstream.category'])),
    ).subscribe((bitstreamsRD) => {
      if (bitstreamsRD.length === 0) {
        this.isLoading = false;
        this.mediaList$.next([]);
      } else {
        this.loadRemoteData('THUMBNAIL', currentPage).subscribe((thumbnailsRD) => {
          for (
            let index = 0;
            index < bitstreamsRD.length;
            index++
          ) {
            bitstreamsRD[index].format
              .pipe(getFirstSucceededRemoteDataPayload())
              .subscribe((format) => {
                const current = this.mediaList$.getValue();
                const mediaItem = this.createMediaViewerItem(
                  bitstreamsRD[index],
                  format,
                  thumbnailsRD.payload && thumbnailsRD.payload.page[index]
                );
                this.mediaList$.next([...current, mediaItem]);
              });
          }
          this.isLoading = false;
        });
      }
    });
  }

  loadRemoteData(
    bundleName: string,
    currentPage: number
  ): Observable<RemoteData<PaginatedList<Bitstream>>> {
    const findOptions: FindListOptions = {
      elementsPerPage: 8,
      currentPage: currentPage
    };
    return this.bitstreamDataService
      .findAllByItemAndBundleName(
        this.item,
        bundleName,
        findOptions,
        true,
        true,
        followLink('format')
      )
      .pipe(
        getFirstSucceededRemoteWithNotEmptyData(),
        tap(remoteData => {
          const limitEl = remoteData.payload.currentPage * findOptions.elementsPerPage;
          if (limitEl >= remoteData.payload.totalElements) {
            this.hasNextPage = false;
          }
        }),
        filter(
          (bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) =>
            hasValue(bitstreamsRD) &&
            (hasValue(bitstreamsRD.errorMessage) || hasValue(bitstreamsRD.payload))
        ),
        take(1)
      );
  }

  createMediaViewerItem(
    original: Bitstream,
    format: BitstreamFormat,
    thumbnail: Bitstream
  ): MediaViewerItem {
    const mediaItem = new MediaViewerItem();
    mediaItem.bitstream = original;
    mediaItem.format = format.mimetype.split('/')[0];
    mediaItem.thumbnail = thumbnail ? thumbnail._links.content.href : null;
    mediaItem.manifestUrl = original.allMetadataValues('dash.manifest')[0];
    return mediaItem;
  }
  scrollDown(event: any) {
    console.log('scrollDown', this.hasNextPage, this.currentPage);
    if (this.hasNextPage) {
      this.loadPlaylistData(++this.currentPage);
    }
  }
}
