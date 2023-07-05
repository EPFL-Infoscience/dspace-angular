import {
  AfterContentInit,
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output, PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';
import videojs from 'video.js';
import Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';
import {MediaViewerItem} from '../../core/shared/media-viewer-item.model';
import {map} from 'rxjs/operators';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {Bitstream} from '../../core/shared/bitstream.model';
import {environment} from '../../../environments/environment';
import {RemoteData} from '../../core/data/remote-data';
import {BitstreamFormat} from '../../core/shared/bitstream-format.model';
import {BitstreamDataService} from '../../core/data/bitstream-data.service';
import {BehaviorSubject} from 'rxjs';


@Component({
  selector: 'ds-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MediaPlayerComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {
  @Input() videoItems: MediaViewerItem[];
  @Input() manifestUrl: Bitstream;

  @Output() scrollDownEmitter = new EventEmitter<number>();

  public IDX = 'clip1';
  public ALT_IMAGE = 'assets/images/replacement_image.svg';
  public isVideo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public videoPlayer: any;
  public audioPlayer: any;

  public currentVideo: MediaViewerItem;
  private readonly configVideo: any;
  private readonly configAudio: any;
  private currentPage = 1;
  private plugin: any;
  private activeIndex = 0;

  envMetadata = environment.advancedAttachmentRendering.metadata;
  constructor(@Inject(DOCUMENT) private _document: Document,
              @Inject(PLATFORM_ID) protected platformId: Object,
              protected bitstreamDataService: BitstreamDataService) {
    this.videoPlayer = false;
    this.audioPlayer = false;
    this.plugin = Wavesurfer;
    this.configAudio = {
      controls: true,
      bigPlayButton: false,
      autoplay: false,
      fluid: false,
      loop: false,
      with: 600,
      height: 480,
      plugins: {
        wavesurfer: {
          backend: 'MediaElement',
          debug: true,
          waveColor: 'green',
          progressColor: 'grey',
          cursorColor: 'grey',
          hideScrollbar: true,
          barHeight: 0.00002,
        }
      }
    };

    this.configVideo = {
      controls: true,
      bigPlayButton: true,
      autoplay: false,
      fluid: false,
      loop: false,
      with: 600,
      height: 480
    };
  }

  ngOnInit() {

  }

  ngAfterContentInit() {
    this.currentVideo = this.videoItems[0];
    this.isVideo$.next(this.checkContentType(this.currentVideo));
  }

  ngAfterViewInit() {
    let audioEl = 'audio_' + this.IDX;
    let videoEl = 'video_' + this.IDX;

    if (isPlatformBrowser(this.platformId)) {

      this.videoPlayer = videojs(this._document.getElementById(videoEl), this.configVideo, () => {
        console.log('player ready! id:', videoEl);
        this.videoPlayer.src({src: this.currentVideo?.manifestUrl, type: 'application/dash+xml'});
      });

      this.audioPlayer = videojs(this._document.getElementById(audioEl), this.configAudio, () => {
        console.log('player ready! id:', audioEl,);
        this.audioPlayer.src({
          src: this.currentVideo?.manifestUrl,
          type: 'application/dash+xml',
          peaks: this.currentVideo.bitstream?.allMetadata('bitstream.audio.peaks')[0]?.value
        });
      });
    }
  }

  ngOnDestroy() {
    this.playersDispose();
  }

  startPlaylist(item: any, index: number) {
    this.activeIndex = index;
    this.currentVideo = item;
    this.isVideo$.next(this.checkContentType(this.currentVideo));

    if (this.isVideo$.value) {
      this.videoPlayer.src({src: this.currentVideo?.manifestUrl, type: 'application/dash+xml'});
    } else {
      this.audioPlayer.src({
        src: this.currentVideo?.manifestUrl,
        type: 'application/dash+xml',
        peaks: this.currentVideo.bitstream.allMetadata('bitstream.audio.peaks')[0].value
      });
    }
  }

  checkContentType(currentMedia: MediaViewerItem) {
    //TODO: update check format existence
    return currentMedia?.format === 'video';
  }

  getContentFormat(item: MediaViewerItem) {
    return item.bitstream.format?.pipe(
      map((rd: RemoteData<BitstreamFormat>) => {
        return rd.payload?.shortDescription;
      })
    );
  }

  getContentName(item: MediaViewerItem) {
    return item.bitstream.firstMetadataValue(this.envMetadata[0].name).split('.')[0];
  }
  onScrollDown() {
    console.log('onScroll');
    this.scrollDownEmitter.emit(++this.currentPage);
  }
  playersDispose(){
    if (this.videoPlayer) {
      this.videoPlayer.dispose();
      this.videoPlayer = false;
    }
    if (this.audioPlayer) {
      this.audioPlayer.dispose();
      this.audioPlayer = false;
    }
  }
}
