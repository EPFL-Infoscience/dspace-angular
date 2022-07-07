import { NgModule } from '@angular/core';
import { CarouselComponent } from './carousel.component';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';

const COMPONENTS = [
    CarouselComponent
];

const MODULES = [
    NgbCarouselModule,
    CommonModule
];
const PROVIDERS = [];

@NgModule({
    imports: [
        ...MODULES,
        SharedModule
    ],
  declarations: [
    ...COMPONENTS
  ],
  providers: [
    ...PROVIDERS
  ],
  exports: [
    ...COMPONENTS
  ]
})

/**
 * This module handles all components, providers and modules that are needed for the menu
 */
export class CarouselModule {

}
