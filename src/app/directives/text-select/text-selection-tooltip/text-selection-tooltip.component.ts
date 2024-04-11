import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'ds-text-selection-tooltip',
  templateUrl: './text-selection-tooltip.component.html',
  styleUrls: ['./text-selection-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  ngOnInit(): void {
    this.top = this.rectangleTop - 6;
    this.left = this.rectangleLeft + this.rectangleWidth / 2;
  }

  // listen to mousedown on host element to avoid clearing selection
  @HostListener('mousedown', ['$event'])
  public handleMousedown(event: MouseEvent): void {
    event.preventDefault();
  }

  public textToSpeech(event: MouseEvent): void {
    if (this.utterance) {
      speechSynthesis.cancel();
    }
    this.utterance = new SpeechSynthesisUtterance(this.text);
    speechSynthesis.speak(this.utterance);
  }

  public ngOnDestroy(): void {
    if (this.utterance) {
      speechSynthesis.cancel();
    }
  }
}
