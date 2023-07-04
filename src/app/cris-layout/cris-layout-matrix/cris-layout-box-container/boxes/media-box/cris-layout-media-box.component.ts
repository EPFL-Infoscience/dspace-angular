import {AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {RenderCrisLayoutBoxFor} from '../../../../decorators/cris-layout-box.decorator';
import {LayoutBox} from '../../../../enums/layout-box.enum';
import {CrisLayoutBoxModelComponent} from '../../../../models/cris-layout-box-component.model';
import {TranslateService} from '@ngx-translate/core';
import {CrisLayoutBox, MediaBoxConfiguration,} from '../../../../../core/layout/models/box.model';
import {Item} from '../../../../../core/shared/item.model';
import {BehaviorSubject, Observable, of as observableOf, Subscription} from 'rxjs';
import {MediaViewerItem} from '../../../../../core/shared/media-viewer-item.model';
import {getFirstCompletedRemoteData, getFirstSucceededRemoteDataPayload} from '../../../../../core/shared/operators';
import {RemoteData} from '../../../../../core/data/remote-data';
import {buildPaginatedList, PaginatedList} from '../../../../../core/data/paginated-list.model';
import {Bitstream} from '../../../../../core/shared/bitstream.model';
import {followLink} from '../../../../../shared/utils/follow-link-config.model';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {hasValue, isEmpty, isNotEmpty} from '../../../../../shared/empty.util';
import {BitstreamFormat} from '../../../../../core/shared/bitstream-format.model';
import {BitstreamDataService, MetadataFilter} from '../../../../../core/data/bitstream-data.service';
import {FindListOptions} from "../../../../../core/data/find-list-options.model";

@Component({
  selector: 'ds-cris-layout-media-box',
  templateUrl: './cris-layout-media-box.component.html',
  styleUrls: ['./cris-layout-media-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@RenderCrisLayoutBoxFor(LayoutBox.VIDEOVIEWER)
export class CrisLayoutMediaBoxComponent extends CrisLayoutBoxModelComponent implements OnInit , AfterViewChecked{
  configuration: string;

  mediaList$: BehaviorSubject<MediaViewerItem[]>;

  mediaList2$: BehaviorSubject<MediaViewerItem[]>;

  thumbnail$: BehaviorSubject<Bitstream> = new BehaviorSubject<Bitstream>(null);

  default: string;

  initialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isLoading: boolean;
  private obsBitstream: Subscription;
  constructor(public cd: ChangeDetectorRef,
              protected translateService: TranslateService,
              @Inject('boxProvider') public boxProvider: CrisLayoutBox,
              @Inject('itemProvider') public itemProvider: Item,
              protected bitstreamDataService: BitstreamDataService) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit(): void {
    console.log("ngOnInit cris");
    super.ngOnInit();
    this.configuration = (this.box.configuration as MediaBoxConfiguration)['media-configuration'];

    this.mediaList$ = new BehaviorSubject([]);
    this.mediaList2$ = new BehaviorSubject([]);

    this.isLoading = true;

    // this.loadRemoteBeatstream();
    // this.retrieveBitstreams();
    this.loadRemoteData('ORIGINAL').pipe(
      tap((data: any) => {
        console.log('loadRemoteData',data);
      }),
      map((remoteData: RemoteData<PaginatedList<Bitstream>> ) => remoteData.payload?.page),
      tap((data: any) => {
        console.log('loadRemoteData2',data);
      }),
      map((bitsreams) => bitsreams?.filter((bitstream) => bitstream.metadata['bitstream.category'])),
      tap((data: any) => {
        console.log('loadRemoteData3',data);
      }),

    ).subscribe((bitstreamsRD) => {
      if (bitstreamsRD.length === 0) {
        this.isLoading = false;
        this.mediaList$.next([]);
      } else {
        this.loadRemoteData('THUMBNAIL').subscribe((thumbnailsRD) => {
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

    this.setDefaultImage();
    this.getBitstreamsByItem().pipe(
      map((bitstreamList: PaginatedList<Bitstream>) => bitstreamList.page),
      switchMap((filteredBitstreams: Bitstream[]) => {
        if (filteredBitstreams.length > 0) {
          if (isEmpty(filteredBitstreams[0].thumbnail)) {
            return observableOf(null);
          } else {
            return filteredBitstreams[0].thumbnail.pipe(
              getFirstCompletedRemoteData(),
              map((thumbnailRD) => {
                if (thumbnailRD.hasSucceeded && isNotEmpty(thumbnailRD.payload)) {
                  return thumbnailRD.payload;
                } else {
                  return null;
                }
              })
            );
          }
        } else {
          return observableOf(null);
        }
      })
    ).subscribe((thumbnail: Bitstream) => {
      if (isNotEmpty(thumbnail)) {
        this.thumbnail$.next(thumbnail);
      }
      this.initialized.next(true);
    });
  }

  ngAfterViewChecked() {
    console.log('ngAfterViewChecked');
    // this.loadRemotBeatstream();
    // this.loadRemotBeatstream2();
  }
  // loadRemoteBeatstream(){
  //   this.loadRemoteData('ORIGINAL').pipe(
  //     tap((data) => {
  //       console.log(data);
  //     }),
  //     map((remoteData: RemoteData<PaginatedList<Bitstream>> ) => remoteData.payload?.page),
  //     map((bitsream) => bitsream.allMetadataValues('dash.manifest'))
  //     filter((bitstreams) => bitstreams)
  // )
  //   .subscribe((bitstreamsRD) => {
  //     if (bitstreamsRD.payload.page.length === 0) {
  //       this.isLoading = false;
  //       this.mediaList$.next([]);
  //     } else {
  //       this.loadRemoteData('THUMBNAIL').subscribe((thumbnailsRD) => {
  //         for (
  //           let index = 0;
  //           index < bitstreamsRD.payload.page.length;
  //           index++
  //         ) {
  //           bitstreamsRD.payload.page[index].format
  //             .pipe(getFirstSucceededRemoteDataPayload())
  //             .subscribe((format) => {
  //               const current = this.mediaList$.getValue();
  //               const mediaItem = this.createMediaViewerItem(
  //                 bitstreamsRD.payload.page[index],
  //                 format,
  //                 thumbnailsRD.payload && thumbnailsRD.payload.page[index]
  //               );
  //               this.mediaList$.next([...current, mediaItem]);
  //             });
  //         }
  //         this.isLoading = false;
  //       });
  //     }
  //   });
  // }

  loadRemotBeatstream2(){
    this.obsBitstream = this.getBitstreamsByItem().subscribe((bitstreamsRD) => {
      console.log('obsBitstream', bitstreamsRD);
      for (
        let index = 0;
        index < bitstreamsRD.page.length;
        index++
      ) {
        bitstreamsRD.page[index].format
          .pipe(getFirstSucceededRemoteDataPayload())
          .subscribe((format) => {
            const current2 = this.mediaList2$.getValue();
            const mediaItem2 = this.createMediaViewerItem2(
              bitstreamsRD.page[index]);
            this.mediaList2$.next([...current2, mediaItem2]);
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
    console.log('manifest',original.allMetadataValues('dash.manifest'));
    mediaItem.manifestUrl = original.allMetadataValues('dash.manifest')[0];
    return mediaItem;
  }

  createMediaViewerItem2(
    original: Bitstream,
    // format: BitstreamFormat
  ): MediaViewerItem {
    const mediaItem = new MediaViewerItem();
    mediaItem.bitstream = original;
    // mediaItem.format = format.mimetype.split('/')[0];
    mediaItem.thumbnail = original._links.content.href ? original._links.content.href : null;
    mediaItem.manifestUrl = original.allMetadataValues('dash.manifest')[0];
    return mediaItem;
  }

  retrieveBitstreams(): void {
    this.getBitstreamsByItem({fetchThumbnail:true}).pipe(
      tap((data)=>console.log('BEFOREgetBitstreamsByItem', data)),
      // filter((bitsream) => !!bitsream),
      map((bitsream) => {
          return bitsream.page.map((currentBitstream)=>{
            return this.createMediaViewerItem2(
              currentBitstream);
          });
      }),
      tap((data)=>console.log('getBitstreamsByItem', data)),
      // take(1)
    ).subscribe((bitstreams: any) => {
      console.log('bitsream', bitstreams);
      this.mediaList2$.next(bitstreams);
    });
  }

  setDefaultImage(): void {
    const eType = this.item.firstMetadataValue('dspace.entity.type');
    this.default = 'assets/images/person-placeholder.svg';
    if (hasValue(eType) && eType.toUpperCase() === 'PROJECT') {
    this.default = 'assets/images/project-placeholder.svg';
    } else if (hasValue(eType) && eType.toUpperCase() === 'ORGUNIT') {
      this.default = 'assets/images/orgunit-placeholder.svg';
    }
  }


  getBitstreamsByItem(options?: FindListOptions): Observable<PaginatedList<Bitstream>> {
    let filters: MetadataFilter[] = [];
    return this.bitstreamDataService
      .showableByItem(this.item.uuid, 'ORIGINAL', filters, options, false, false, followLink('thumbnail'), followLink('format'))
      .pipe(
        tap((data) => console.log('data 2 getBitstreamsByItem', data)),
        getFirstCompletedRemoteData(),
        map((response: RemoteData<PaginatedList<Bitstream>>) => {
          return response.hasSucceeded ? response.payload : buildPaginatedList(null, []);
        }),
        tap((data) => console.log('data getBitstreamsByItem', data)),
      );
  }

}
