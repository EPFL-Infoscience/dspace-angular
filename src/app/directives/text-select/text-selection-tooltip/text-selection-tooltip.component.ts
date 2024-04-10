import { ChangeDetectionStrategy, Component, HostBinding, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'ds-text-selection-tooltip',
  templateUrl: './text-selection-tooltip.component.html',
  styleUrls: ['./text-selection-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TextSelectionTooltipComponent implements OnDestroy {

  @Input()
  @HostBinding('style.left.px')
  left: number;

  @Input()
  @HostBinding('style.top.px')
  top: number;

  @Input()
  text: string;

  utterance: SpeechSynthesisUtterance;

  public textToSpeech(event: MouseEvent): void {
    event.preventDefault();

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
