import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import videojs from 'video.js';
import Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';
import { BehaviorSubject } from 'rxjs';

import { MediaViewerItem } from '../../core/shared/media-viewer-item.model';

@Component({
  selector: 'ds-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MediaPlayerComponent implements OnInit, OnDestroy {

  /**
   * The item uuid
   */
  @Input() itemUUID: string;

  /**
   * If given, the uuid of the bitstream to start playing
   */
  @Input() startUUID: string;

  /**
   * A boolean representing whether player is initialized or not
   */
  public isPlayerInitialized$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * A boolean representing whether the playing media is a video or not
   */
  public isVideo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /**
   * The instance of videojs for video media
   */
  public videoPlayer: any;

  /**
   * The instance of videojs for video media
   */
  public audioPlayer: any;

  /**
   * A boolean representing whether if is CSR or not
   */
  public isPlatformBrowser: boolean;

  /**
   * The playing media item
   */
  public currentItem$: BehaviorSubject<MediaViewerItem> = new BehaviorSubject<MediaViewerItem>(null);

  /**
   * The config object for video player
   * @private
   */
  private readonly configVideo: any;

  /**
   * The config object for audio player
   * @private
   */
  private readonly configAudio: any;

  private plugin: any;

  constructor(@Inject(DOCUMENT) private _document: Document,
              @Inject(PLATFORM_ID) protected platformId: string) {
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
    this.isPlatformBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Handle the selected item given by the playlist
   * @param item
   */
  setNewMediaItem(item: MediaViewerItem) {
    if (this.isPlayerInitialized$.value) {
      this.changePlayingItem(item);
    } else {
      this.initPlayer(item);
    }
  }

  /**
   * Init videojs player with the given item as source
   *
   * @param item
   * @private
   */
  private initPlayer(item: MediaViewerItem): void {
    let audioEl = 'audio_player';
    let videoEl = 'video_player';

    if (this.isPlatformBrowser) {
      this.isPlayerInitialized$.next(true);
      this.currentItem$.next(item);
      this.isVideo$.next(this.checkContentType(item));

      if (this.isVideo$.value) {
        this.videoPlayer = videojs(this._document.getElementById(videoEl), this.configVideo, () => {
          console.log('player ready! id:', videoEl);
          this.videoPlayer.src({ src: this.currentItem$?.value?.manifestUrl, type: 'application/dash+xml' });
        });
      } else {
        this.audioPlayer = videojs(this._document.getElementById(audioEl), this.configAudio, () => {
          console.log('player ready! id:', audioEl,);
          this.audioPlayer.src({
            src: this.currentItem$?.value?.manifestUrl,
            type: 'application/dash+xml',
            peaks: this.currentItem$?.value?.bitstream?.allMetadata('bitstream.audio.peaks')[0]?.value
          });
        });
      }
    }
  }

  private checkContentType(currentMedia: MediaViewerItem) {
    //TODO: update check format existence
    return currentMedia?.format === 'video';
  }

  /**
   * Change the source according to the given item
   *
   * @param item
   * @private
   */
  private changePlayingItem(item: MediaViewerItem) {
    if (this.isVideo$.value) {
      this.videoPlayer.src({ src: this.currentItem$?.value?.manifestUrl, type: 'application/dash+xml' });
    } else {
      this.audioPlayer.src({
        src: this.currentItem$?.value?.manifestUrl,
        type: 'application/dash+xml',
        peaks: this.currentItem$?.value?.bitstream.allMetadata('bitstream.audio.peaks')[0].value
      });
    }
  }

  /**
   * Dispose player on destroy
   */
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
}
