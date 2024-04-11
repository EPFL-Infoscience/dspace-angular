import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NgIf } from '@angular/common';
import { NativeWindowRef, NativeWindowService } from '../../../core/services/window.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ds-text-selection-tooltip',
  templateUrl: './text-selection-tooltip.component.html',
  styleUrls: ['./text-selection-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf
  ],
  standalone: true
})
export class TextSelectionTooltipComponent implements OnInit, OnDestroy {

  @Input()
  rectangleLeft = 0;

  @Input()
  rectangleTop = 0;

  @Input()
  rectangleWidth = 0;

  @Input()
  rectangleHeight = 0;

  @Input()
  text: string;

  @HostBinding('style.left.px')
  left: number;

  @HostBinding('style.top.px')
  top: number;

  @HostBinding('style.right.px')
  right: number;

  @HostBinding('class.bottom-placement')
  bottomPlacement = false;

  utterance: SpeechSynthesisUtterance;
  isPaused = false;

  bindedCheckPosition = this.checkPosition.bind(this);

  constructor(
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private translate: TranslateService) {

  }

  ngOnInit(): void {
    this.left = this.rectangleLeft + this.rectangleWidth / 2;
    this.checkPosition();
    this.ngZone.runOutsideAngular(() => {
      // listen to scroll event to update position
      window.addEventListener('scroll', this.bindedCheckPosition);
    });
  }

  checkPosition() {
    if (this.rectangleTop < this._window.nativeWindow.scrollY) {
      this.top = this.rectangleTop + this.rectangleHeight + 6;
      this.bottomPlacement = true;
    } else {
      this.top = this.rectangleTop - 6;
      this.bottomPlacement = false;
    }
    this.changeDetectorRef.detectChanges();
  }

  // listen to mousedown on host element to avoid clearing selection
  @HostListener('mousedown', ['$event'])
  public handleMousedown(event: MouseEvent): void {
    event.preventDefault();
  }

  public textToSpeech(): void {
    if (this.utterance) {
      speechSynthesis.cancel();
    }
    this.utterance = new SpeechSynthesisUtterance(this.text);
    this.utterance.lang = this.translate.currentLang;
    this.utterance.onend = () => {
      this.utterance = null;
      this.changeDetectorRef.detectChanges();
    };
    speechSynthesis.speak(this.utterance);
  }

  ngOnDestroy(): void {
    if (this.utterance) {
      speechSynthesis.cancel();
    }
    window.removeEventListener('scroll', this.bindedCheckPosition);
  }

  pauseTextToSpeech() {
    speechSynthesis.pause();
    this.isPaused = true;
  }

  resumeTextToSpeech() {
    speechSynthesis.resume();
    this.isPaused = false;
  }
}
