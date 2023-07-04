import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit, AfterContentInit,
  ViewEncapsulation, ElementRef, Inject, AfterContentChecked, AfterViewChecked
} from '@angular/core';
import videojs from 'video.js';
import WaveSurfer from 'wavesurfer.js';
import * as Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';
import {BehaviorSubject, Observable} from 'rxjs';
import {MediaViewerItem} from "../../../../../../core/shared/media-viewer-item.model";
import {filter, map, switchMap, tap} from "rxjs/operators";
import {FileService} from "../../../../../../core/shared/file.service";
import {DOCUMENT} from "@angular/common";
import {Bitstream} from "../../../../../../core/shared/bitstream.model";
import {environment} from "../../../../../../../environments/environment";
import {RemoteData} from "../../../../../../core/data/remote-data";
import {BitstreamFormat} from "../../../../../../core/shared/bitstream-format.model";

@Component({
  selector: 'ds-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MediaPlayerComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit, AfterContentChecked, AfterViewChecked{
  idx = 'clip1';
  isVideo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private _elementRef: ElementRef;
  private readonly configVideo: any;
  private readonly configAudio: any;
  private videoPlayer: any;
  private audioPlayer: any;
  public default = 'assets/images/replacement_image.svg';

  private plugin: any;
  private activeIndex = 0;
  currentVideo: MediaViewerItem;
  @Input() videoItems: MediaViewerItem[];
  @Input() videoItems2: MediaViewerItem[];
  @Input() manifestUrl: Bitstream;
  @Input() thambnails: any;
  private manifest: string[];
  private manifestPeaks: string[];

  envMetadata = environment.advancedAttachmentRendering.metadata;

  constructor(@Inject(DOCUMENT) private _document: Document,) {
    this.videoPlayer = false;
    this.audioPlayer = false;
    this.plugin = Wavesurfer;


    this.configAudio = {
      controls: true,
      bigPlayButton: false,
      autoplay: false,
      fluid: false,
      loop: false,
      with:600,
      height:480,
      plugins: {
        // enable videojs-wavesurfer plugin
        wavesurfer: {
          // configure videojs-wavesurfer
          backend: 'MediaElement',
          // displayMilliseconds: true,
          debug: true,
          waveColor: 'green',
          progressColor: 'grey',
          cursorColor: 'grey',
          hideScrollbar: true,
          barHeight:0.00002,
        }
      }
    };

    this.configVideo = {
      controls: true,
      bigPlayButton: true,
      autoplay: false,
      fluid: false,
      loop: false,
      with:600,
      height:480
    };
  }

  ngOnInit() {
    this.videoPlayer.dispose();
    this.videoPlayer = false;
    this.audioPlayer.dispose();
    this.audioPlayer = false;
  }

  ngAfterContentChecked(){
  }

  ngAfterViewChecked() {
  }

  ngAfterContentInit() {
    console.log('videoItems',this.videoItems);
    console.log('videoItems2',this.videoItems2);
    console.log('thambnails',this.thambnails);
    this.currentVideo = this.videoItems[0];
    this.isVideo$.next(this.checkContentType(this.currentVideo));
    console.log('currentItem',this.currentVideo);
    console.log('peeks',this.currentVideo.bitstream.allMetadata('bitstream.audio.peaks')[0].value);
  }

  ngAfterViewInit() {
    let audioEl = 'audio_' + this.idx;
    let videoEl = 'video_' + this.idx;

    console.log("isVideo", this.isVideo$.value);

      this.videoPlayer = videojs(this._document.getElementById(videoEl), this.configVideo, () => {
        console.log('player ready! id:', videoEl);
        this.videoPlayer.src({src: this.currentVideo.manifestUrl, type: 'application/dash+xml'});
      });

      this.audioPlayer = videojs(this._document.getElementById(audioEl), this.configAudio, () => {
        console.log('player ready! id:', audioEl, );
        this.audioPlayer.src({
                              src: this.currentVideo.manifestUrl,
                              type: 'application/dash+xml',
                              peaks: this.currentVideo.bitstream?.allMetadata('bitstream.audio.peaks')[0]?.value
        });
        const msg = 'Using video.js ' + videojs.VERSION +
          ' with videojs-wavesurfer ' + videojs.getPluginVersion('wavesurfer') +
          ' and wavesurfer.js ' + WaveSurfer.VERSION;
        videojs.log(msg);
      });
  }


  ngOnDestroy() {
    if (this.videoPlayer) {
      this.videoPlayer.dispose();
      this.videoPlayer = false;
    }
    if (this.audioPlayer) {
      this.audioPlayer.dispose();
      this.audioPlayer = false;
    }
  }

  startPlaylist(item: any, index: number) {
    this.activeIndex = index;
    this.currentVideo = item;
    this.isVideo$.next(this.checkContentType(this.currentVideo));

    console.log('currentItem',this.currentVideo);
    if (this.isVideo$.value){
      this.videoPlayer.src({src: this.currentVideo.manifestUrl, type: 'application/dash+xml'});
    } else {
      this.audioPlayer.src({
        src: this.currentVideo.manifestUrl,
        type: 'application/dash+xml',
        peaks: this.currentVideo.bitstream.allMetadata('bitstream.audio.peaks')[0].value
      });
    }
  }

  checkContentType(currentMedia: MediaViewerItem){
    console.log("media-format", currentMedia.format);
    return currentMedia.format === 'video';
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
}
