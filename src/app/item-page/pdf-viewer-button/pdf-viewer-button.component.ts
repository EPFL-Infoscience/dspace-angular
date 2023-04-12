import { Component, Input, OnInit } from '@angular/core';
import { getBitstreamItemViewerPath } from '../item-page-routing-paths';
import { Router } from '@angular/router';
import { Item } from '../../core/shared/item.model';
import { Bitstream } from '../../core/shared/bitstream.model';
import {
  AttachmentRenderingType,
  AttachmentTypeRendering
} from '../../cris-layout/cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/advanced-attachment/bitstream-attachment/attachment-type.decorator';

@Component({
  selector: 'ds-pdf-viewer-button',
  templateUrl: './pdf-viewer-button.component.html',
  styleUrls: ['./pdf-viewer-button.component.scss']
})

@AttachmentTypeRendering(AttachmentRenderingType.PDF, true)
export class PdfViewerButtonComponent {

  /**
   * Current DSpace Item
   */
  @Input() item: Item;
  /**
   * The bitstream
   */
  @Input() bitstream: Bitstream;

  constructor(private router: Router) {
  }

  public openPdfViewer() {
    this.router.navigate([getBitstreamItemViewerPath(this.item, this.bitstream, 'pdf')]);
  }

}
