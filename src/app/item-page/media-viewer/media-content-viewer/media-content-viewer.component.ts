import {Component, Input} from '@angular/core';
import {
  AttachmentRenderingType,
  AttachmentTypeRendering
} from '../../../cris-layout/cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/advanced-attachment/bitstream-attachment/attachment-type.decorator';
import {Item} from '../../../core/shared/item.model';
import {Bitstream} from '../../../core/shared/bitstream.model';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {getBitstreamItemViewerDetailsPath, getBitstreamItemViewerPath} from '../../item-page-routing-paths';


@Component({
  selector: 'ds-media-content-viewer',
  templateUrl: './media-content-viewer.component.html',
  styleUrls: ['./media-content-viewer.component.scss'],
})
@AttachmentTypeRendering(AttachmentRenderingType.VIDEO, true)
@AttachmentTypeRendering(AttachmentRenderingType.AUDIO, true)
export class MediaContentViewerComponent {

  /**
   * Current DSpace Item
   */
  @Input() item: Item;
  /**
   * The bitstream
   */
  @Input() bitstream: Bitstream;
    constructor(
    private router: Router
  ) {}
  async openViewer() {
    if (environment.advancedAttachmentRendering.showViewerOnSameItemPage) {
      await this.router.navigate([getBitstreamItemViewerDetailsPath(this.item, this.bitstream, 'media')], {fragment: 'viewer'});
    } else {
      await this.router.navigate([getBitstreamItemViewerPath(this.item, this.bitstream, 'media')]);
    }
  }
}
