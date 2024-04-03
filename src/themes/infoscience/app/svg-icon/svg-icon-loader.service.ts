// svg-icon-loader.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SvgIconLoaderService {
    private defaultSvgPath = 'assets/infoscience/icons/icons.svg';
    private defaultFeatherSvgPath = 'assets/infoscience/icons/feather-sprite.svg';

    constructor(private http: HttpClient) { }

    loadIcons(): void {
        const svgPaths = [this.getCustomPath('svgPath', this.defaultSvgPath),
        this.getCustomPath('featherSvgPath', this.defaultFeatherSvgPath)];

        svgPaths.forEach(path => {
            this.http.get(path, { responseType: 'text' }).subscribe(svgContent => {
                this.injectSvg(svgContent);
            });
        });
    }

    private getCustomPath(propertyName: string, defaultValue: string): string {
        const customPath = (window as any)[propertyName];
        return customPath ? customPath : defaultValue;
    }

    private injectSvg(svgContent: string): void {
        const div = document.createElement('div');
        div.style.display = 'none';
        div.innerHTML = svgContent;
        document.body.appendChild(div);
    }
}
