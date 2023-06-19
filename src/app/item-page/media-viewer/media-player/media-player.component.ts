import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import videojs from 'video.js';
import WaveSurfer from 'wavesurfer.js';
import * as Wavesurfer from 'videojs-wavesurfer/dist/videojs.wavesurfer.js';

@Component({
  selector: 'ds-media-player',
  templateUrl: './media-player.component.html',
  styleUrls: ['./media-player.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MediaPlayerComponent implements OnInit, OnDestroy {
  // @ViewChild('target', {static: true}) target: ElementRef;
  idx = 'clip1';

  private configVideo: any;
  private configAudio: any;
  private player: any;
  private plugin: any;
  @Input() options: {
    autoplay: boolean,
    controls: boolean,
    sources: {
      src: string,
      type: string,
    }[]
  };

  wavesurfer: {
    backend: 'MediaElement',
    displayMilliseconds: true,
    debug: true,
    waveColor: '#4A4A22',
    progressColor: 'black',
    cursorColor: 'black',
    hideScrollbar: true
  };


  videoItems = [
    {
      title: 'Elephants Dream',
      src: 'assets/hal.wav',
      type: 'audio/wav',
      poster: 'assets/images/sound-audio-placeholder.png'

    },
    {
      title: 'Chromecast – For Bigger Joyrides',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg'
    },
    {
      title: 'Elephants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Elephants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Elephants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Elephants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Elephants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Elephants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Elephants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Elephhttp://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4ants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Elephants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Elephants Dream',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'video/mp4',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'

    },
    {
      title: 'Sintel',
      src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      type: 'video/webm',
      poster: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg'
    }
  ];

  activeIndex = 0;
  currentVideo = this.videoItems[this.activeIndex];
  data: any;


  constructor(private elementRef: ElementRef,) {
    this.player = false;

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
          displayMilliseconds: true,
          debug: true,
          waveColor: 'green',
          progressColor: 'black',
          cursorColor: 'black',
          hideScrollbar: true
        }
      }
    };

    this.configVideo = {
      controls: true,
      bigPlayButton: false,
      autoplay: false,
      fluid: false,
      loop: false,
      with:600,
      height:480
    };
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // ID with which to access the template's audio element
    let el = 'audio_' + this.idx;

    if (this.currentVideo.type === 'video/mp4') {

      this.player = videojs(document.getElementById(el), this.configVideo, () => {
        console.log('player ready! id:', el);
        this.player.src({src: this.currentVideo.src});
      });
    }
      this.player = videojs(document.getElementById(el), this.configAudio, () => {
        console.log('player ready! id:', el);
        this.player.src({src: this.currentVideo.src});
      });

    this.player.on('waveReady', event => {
      console.log('waveform is ready!');
    });

    this.player.on('playbackFinish', event => {
      console.log('playback finished.');
    });

    // error handling
    this.player.on('error', (element, error) => {
      console.warn(error);
    });

    this.player.on('deviceError', () => {
      console.error('device error:', this.player.deviceErrorCode);
    });
  }


  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
      this.player = false;
    }
  }

  startPlaylist(item: any, index: number) {
    this.activeIndex = index;
    this.currentVideo = item;
    let el = 'audio_' + this.idx;
    if (this.currentVideo.type === 'audio/wav'){
      this.player = videojs(document.getElementById(el), this.configAudio, () => {
        console.log(this.currentVideo.src);
        this.player.src({src: this.currentVideo.src});
      });
    } else {
      this.player = videojs(document.getElementById(el), this.configVideo, () => {
        console.log(this.currentVideo.src);
        this.player.src({src: this.currentVideo.src});
      });
    }
    // this.player.src({src: this.currentVideo.src});
  }
}
