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
  @Input() editValue: string;
  @HostBinding('class.focus') isFocus: boolean;
  @Output() editValueChange = new EventEmitter();
  /**
   * Nu markdown library options (default is chinese)
   */
   options = {
    minHeight: 200,
    lang: 'en_US',
    mode: 'ir',
    preview: {
      markdown: {
        codeBlockPreview: false,
      }
    },
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      'table',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      'insert-before',
      'insert-after',
      '|',
      'undo',
      'redo',
      '|',
      'fullscreen',
      'preview'
    ],
  };

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
    console.log(this.editValue);
    this.editValueChange.emit(this.editValue);
  }
}
