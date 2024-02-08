import { NgModule } from '@angular/core';

import { SharedModule } from '../shared.module';
import { OpenStreetMapsComponent } from './open-street-maps.component';

const COMPONENTS = [
    OpenStreetMapsComponent
];

@NgModule({
  imports: [ SharedModule ],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})

/**
 * This module handles open street maps functionalities
 */
export class OpenStreetMapsModule {}
