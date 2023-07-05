import {NgModule} from '@angular/core';
import {MediaPlayerComponent} from './media-player.component';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared.module';


const COMPONENTS = [
  MediaPlayerComponent
];

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})

export class MediaPlayerModule {}
