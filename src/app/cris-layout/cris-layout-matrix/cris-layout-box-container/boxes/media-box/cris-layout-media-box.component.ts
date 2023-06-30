import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {RenderCrisLayoutBoxFor} from '../../../../decorators/cris-layout-box.decorator';
import {LayoutBox} from '../../../../enums/layout-box.enum';
import {CrisLayoutBoxModelComponent} from '../../../../models/cris-layout-box-component.model';
import {TranslateService} from '@ngx-translate/core';
import {
  CrisLayoutBox,
  MediaBoxConfiguration,
} from '../../../../../core/layout/models/box.model';
import {Item} from '../../../../../core/shared/item.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {MediaViewerItem} from '../../../../../core/shared/media-viewer-item.model';
import {getFirstSucceededRemoteDataPayload} from '../../../../../core/shared/operators';
import {RemoteData} from '../../../../../core/data/remote-data';
import {PaginatedList} from '../../../../../core/data/paginated-list.model';
import {Bitstream} from '../../../../../core/shared/bitstream.model';
import {followLink} from '../../../../../shared/utils/follow-link-config.model';
import {filter, take} from 'rxjs/operators';
import {hasValue} from '../../../../../shared/empty.util';
import {BitstreamFormat} from '../../../../../core/shared/bitstream-format.model';
import {BitstreamDataService} from '../../../../../core/data/bitstream-data.service';

@Component({
  selector: 'ds-cris-layout-media-box',
  templateUrl: './cris-layout-media-box.component.html',
  styleUrls: ['./cris-layout-media-box.component.scss']
})
@RenderCrisLayoutBoxFor(LayoutBox.VIDEOVIEWER)
export class CrisLayoutMediaBoxComponent extends CrisLayoutBoxModelComponent implements OnInit {
  configuration: string;

  mediaList$: BehaviorSubject<MediaViewerItem[]>;

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

    console.log('item in cris',this.item);

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
