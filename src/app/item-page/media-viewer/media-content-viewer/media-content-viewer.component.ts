import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {
  AttachmentRenderingType,
  AttachmentTypeRendering
} from '../../../cris-layout/cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/advanced-attachment/bitstream-attachment/attachment-type.decorator';
import {Item} from '../../../core/shared/item.model';
import {Bitstream} from '../../../core/shared/bitstream.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MediaViewerPopupComponent} from '../media-viewer-popup/media-viewer-popup.component';


@Component({
  selector: 'ds-media-content-viewer',
  templateUrl: './media-content-viewer.component.html',
  styleUrls: ['./media-content-viewer.component.scss'],
})
@AttachmentTypeRendering(AttachmentRenderingType.VIDEO, true)
export class MediaContentViewerComponent implements OnInit, OnDestroy{

  /**
   * Current DSpace Item
   */
  @Input() item: Item;
  /**
   * The bitstream
   */
  @Input() bitstream: Bitstream;



  constructor(
    private  modelService: NgbModal
  ) {}

  // Instantiate a Video.js player OnInit
  ngOnInit() {
    }

  ngOnDestroy() {
  }

  openViewer() {
    this.modelService.open(MediaViewerPopupComponent,{size:'xl'});
  }
}
