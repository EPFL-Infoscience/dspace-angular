import { Component, EventEmitter, HostBinding,  Input,    OnInit, Output } from '@angular/core';
import '@github/markdown-toolbar-element';

@Component({
  selector: 'ds-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit {
  // to allow multiple textarea on the same screen, need to set an uniqueId for the textarea
  controlId: string;
  @Input() control: string;
  @HostBinding('class.focus') isFocus: boolean;
  @Output() controlChange = new EventEmitter();

  // tslint:disable-next-line:no-empty
  constructor() {}

  ngOnInit(): void {
    this.controlId = `MarkdownEditor-${Math.floor(100000 * Math.random())}`;
  }

  focus() {
    this.isFocus = true;
  }

  blur() {
    this.isFocus = false;
  }

  pushData() {
    this.controlChange.emit(this.control);
  }
}
