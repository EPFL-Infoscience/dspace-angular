import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';

import { NgbAccordion } from '@ng-bootstrap/ng-bootstrap';

import { hasValue, isEmpty, isNotEmpty } from '../empty.util';
import { debounceTime, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ds-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
/**
 * Component that displays the pdf content using pdfjs.
 */
export class PdfViewerComponent implements OnChanges, OnDestroy {

  /**
   * The pdf link to be displayed in the preview pdf section
   */
  @Input() pdfSrc: string;

  private sub: Subscription;
  /**
   * Reference of the accordion
   */
  @ViewChild('accordionRef') accordionRef: NgbAccordion;

  /**
   * Reference of the pdf viewer
   */
  @ViewChild('pdfViewer') pdfViewer;
  @ViewChildren('pdfViewer', { read: ElementRef }) pdfViewerList: QueryList<ElementRef>;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    if (isEmpty(this.pdfSrc)) {
      this.accordionRef.collapseAll();
    }

    this.sub = this.pdfViewerList.changes.pipe(
      filter(() => this.pdfViewerList?.length > 0 && this.pdfViewer),
      debounceTime(1000)
    ).subscribe(data => {
        this.refreshPdfViewer(this.pdfSrc);
      }
    );
  }

  /**
   * When changes happen to the pdf link refresh the pdf viewer and open accordion.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (isNotEmpty(changes?.pdfSrc?.currentValue)) {
      this.accordionRef.expand('pdf-viewer');
      this.refreshPdfViewer(changes.pdfSrc.currentValue);
    }
  }

  private refreshPdfViewer(src: string) {
    if (this.pdfViewer && isNotEmpty(src)) {
      this.pdfViewer.pdfSrc = src;
      this.pdfViewer.refresh();
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (hasValue(this.sub)) {
      this.sub.unsubscribe();
    }
  }
}
