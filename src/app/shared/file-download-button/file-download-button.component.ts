import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Bitstream } from '../../core/shared/bitstream.model';
import { FileDownloadLinkComponent } from '../file-download-link/file-download-link.component';

@Component({
  selector: 'ds-file-download-button',
  templateUrl: './file-download-button.component.html',
  styleUrls: ['./file-download-button.component.scss']
})
/**
 * Component displaying a download button or the request a coppy button depending on authorization
 */
export class FileDownloadButtonComponent extends FileDownloadLinkComponent implements OnInit {

  /**
   * Format of the bitstream so we can show/hide the preview pdf button
   */
  @Input() format: string;

  /**
   * When previewPdf button is clicked emit the event.
   */
  @Output() previewPdf: EventEmitter<Bitstream> = new EventEmitter();

}
