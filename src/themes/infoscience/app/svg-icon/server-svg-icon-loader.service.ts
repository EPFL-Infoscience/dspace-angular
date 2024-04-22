import { Injectable } from '@angular/core';
import { SvgIconLoaderService } from './svg-icon-loader.service';

@Injectable({
    providedIn: 'root'
})
export class ServerSvgIconLoaderService extends SvgIconLoaderService {
    loadIcons(): void {
      return;
    }

}
