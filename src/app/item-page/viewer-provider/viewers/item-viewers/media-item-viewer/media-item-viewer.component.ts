import { Component, OnInit } from '@angular/core';
import {BaseItemViewerComponent} from '../base-item-viewer.component';
import {BehaviorSubject, Observable} from "rxjs";
import {MediaViewerItem} from "../../../../../core/shared/media-viewer-item.model";
import {getFirstSucceededRemoteDataPayload} from "../../../../../core/shared/operators";
import {RemoteData} from "../../../../../core/data/remote-data";
import {PaginatedList} from "../../../../../core/data/paginated-list.model";
import {Bitstream} from "../../../../../core/shared/bitstream.model";
import {followLink} from "../../../../../shared/utils/follow-link-config.model";
import {hasValue} from "../../../../../shared/empty.util";
import {BitstreamFormat} from "../../../../../core/shared/bitstream-format.model";
import {BitstreamDataService} from "../../../../../core/data/bitstream-data.service";
import {filter, take} from "rxjs/operators";

@Component({
  selector: 'ds-media-item-viewer',
  templateUrl: './media-item-viewer.component.html',
  styleUrls: ['./media-item-viewer.component.scss']
})
export class MediaItemViewerComponent extends BaseItemViewerComponent implements OnInit {

  mediaList$: BehaviorSubject<MediaViewerItem[]>;

  isLoading: boolean;

  constructor(
    protected bitstreamDataService: BitstreamDataService
  ) {
    super();
  }

  ngOnInit(): void {
    console.log('item in',this.item$);
      this.mediaList$ = new BehaviorSubject([]);
      this.isLoading = true;
      this.loadRemoteData('ORIGINAL').subscribe((bitstreamsRD) => {
        if (bitstreamsRD.payload.page.length === 0) {
          this.isLoading = false;
          this.mediaList$.next([]);
        } else {
          this.loadRemoteData('THUMBNAIL').subscribe((thumbnailsRD) => {
            for (
              let index = 0;
              index < bitstreamsRD.payload.page.length;
              index++
            ) {
              bitstreamsRD.payload.page[index].format
                .pipe(getFirstSucceededRemoteDataPayload())
                .subscribe((format) => {
                  const current = this.mediaList$.getValue();
                  const mediaItem = this.createMediaViewerItem(
                    bitstreamsRD.payload.page[index],
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
      bundleName: string
    ): Observable<RemoteData<PaginatedList<Bitstream>>> {
      return this.bitstreamDataService
        .findAllByItemAndBundleName(
          this.item,
          bundleName,
          {},
          true,
          true,
          followLink('format')
        )
        .pipe(
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
}
