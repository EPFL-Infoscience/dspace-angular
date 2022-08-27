import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { NgbAccordion } from '@ng-bootstrap/ng-bootstrap';
import { isUndefined } from '../empty.util';

@Component({
  selector: 'ds-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
/**
  * Component that displays the pdf content using pdfjs.
  */
export class PdfViewerComponent implements OnChanges {

  /**
    * The pdf link to be displayed in the preview pdf section
    */
  @Input() pdfSrc: string;

  /**
    * Reference of the accordion
    */
  @ViewChild('accordionRef') accordionRef: NgbAccordion;

  /**
  * Reference of the pdf viewer
  */
  @ViewChild('pdfViewer') pdfViewer;

  /**
   * When changes happen to the pdf link refresh the pdf viewer and open accordion.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('pdfSrc') && changes.pdfSrc.currentValue !== changes.pdfSrc.previousValue) {
      this.accordionRef.expand('pdf-viewer');
      if (!isUndefined(changes.pdfSrc.previousValue)) {
        this.pdfViewer.refresh();
      }
    }
  }

}
