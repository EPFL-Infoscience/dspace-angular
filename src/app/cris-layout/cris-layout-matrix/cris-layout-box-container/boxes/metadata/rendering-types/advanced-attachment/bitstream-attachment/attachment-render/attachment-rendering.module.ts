import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FileDownloadButtonComponent
} from '../../../../../../../../../shared/file-download-button/file-download-button.component';
import { SearchModule } from '../../../../../../../../../shared/search/search.module';
import { SharedModule } from '../../../../../../../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { IIIFToolbarComponent } from '../../../../../../../../../item-page/iiif-toolbar/iiif-toolbar.component';
import {
  PdfViewerButtonComponent
} from '../../../../../../../../../item-page/pdf-viewer-button/pdf-viewer-button.component';
import {
  MediaContentViewerComponent
} from "../../../../../../../../../item-page/media-viewer/media-content-viewer/media-content-viewer.component";
import {HomePageModule} from "../../../../../../../../../home-page/home-page.module";
import {VgCoreModule} from "@videogular/ngx-videogular/core";
import {VgOverlayPlayModule} from "@videogular/ngx-videogular/overlay-play";
import {VgControlsModule} from "@videogular/ngx-videogular/controls";
import {VgBufferingModule} from "@videogular/ngx-videogular/buffering";

const COMPONENTS = [
  FileDownloadButtonComponent,
  IIIFToolbarComponent,
  PdfViewerButtonComponent,
  MediaContentViewerComponent,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    SearchModule,
    SharedModule,
    TranslateModule,
    HomePageModule,
    VgCoreModule,
    VgOverlayPlayModule,
    VgControlsModule,
    VgBufferingModule
  ],
  exports: [...COMPONENTS]
})
export class AttachmentRenderingModule {
}
