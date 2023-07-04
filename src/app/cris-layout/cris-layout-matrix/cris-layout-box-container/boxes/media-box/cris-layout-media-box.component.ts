import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {RenderCrisLayoutBoxFor} from '../../../../decorators/cris-layout-box.decorator';
import {LayoutBox} from '../../../../enums/layout-box.enum';
import {CrisLayoutBoxModelComponent} from '../../../../models/cris-layout-box-component.model';
import {TranslateService} from '@ngx-translate/core';
import {CrisLayoutBox, MediaBoxConfiguration,} from '../../../../../core/layout/models/box.model';
import {Item} from '../../../../../core/shared/item.model';
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
import {filter, map, take, tap} from 'rxjs/operators';
import {hasValue} from '../../../../../shared/empty.util';
import {BitstreamFormat} from '../../../../../core/shared/bitstream-format.model';
import {BitstreamDataService} from '../../../../../core/data/bitstream-data.service';
import {FindListOptions} from '../../../../../core/data/find-list-options.model';

@Component({
  selector: 'ds-cris-layout-media-box',
  templateUrl: './cris-layout-media-box.component.html',
  styleUrls: ['./cris-layout-media-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@RenderCrisLayoutBoxFor(LayoutBox.VIDEOVIEWER)
export class CrisLayoutMediaBoxComponent extends CrisLayoutBoxModelComponent implements OnInit {
  configuration: string;
  mediaList$: BehaviorSubject<MediaViewerItem[]>;
  private currentPage = 1;
  public hasNextPage = true;
  initialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;

  constructor(public cd: ChangeDetectorRef,
              protected translateService: TranslateService,
              @Inject('boxProvider') public boxProvider: CrisLayoutBox,
              @Inject('itemProvider') public itemProvider: Item,
              protected bitstreamDataService: BitstreamDataService) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.configuration = (this.box.configuration as MediaBoxConfiguration)['media-configuration'];
    this.mediaList$ = new BehaviorSubject([]);
    this.isLoading = true;
    this.loadPlaylistData(this.currentPage);
  }

  loadPlaylistData(currentPage: number) {
    this.loadRemoteData('ORIGINAL', currentPage).pipe(
      map((remoteData: RemoteData<PaginatedList<Bitstream>>) => remoteData.payload?.page),
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
