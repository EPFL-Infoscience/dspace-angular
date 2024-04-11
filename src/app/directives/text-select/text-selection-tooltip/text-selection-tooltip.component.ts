import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NgIf } from '@angular/common';

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

  @HostBinding('style.bottom.px')
  bottom: number;

  utterance: SpeechSynthesisUtterance;
  isPaused = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.top = this.rectangleTop - 6;
    this.left = this.rectangleLeft + this.rectangleWidth / 2;
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
