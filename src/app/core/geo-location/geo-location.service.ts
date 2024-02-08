import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';


@Injectable()
export class GeoLocationService {

    constructor(
        protected translateService: TranslateService,
    ) {
    }

    public getLocation(geoLocationOptions?: any): Observable<any> {
        geoLocationOptions = geoLocationOptions || { timeout: 5000 };
        return Observable.create(observer => {

            if (window.navigator && window.navigator.geolocation) {
                window.navigator.geolocation.getCurrentPosition(
                (position) => {
                    observer.next(position);
                    observer.complete();
                },
                (error) => {
                    switch (error.code) {
                    case 1:
                        observer.error(this.translateService.get('errors.location.permissionDenied'));
                        break;
                    case 2:
                        observer.error(this.translateService.get('errors.location.positionUnavailable'));
                        break;
                    case 3:
                        observer.error(this.translateService.get('errors.location.timeout'));
                        break;
                    }
                },
                geoLocationOptions);
            } else {
                observer.error(this.translateService.get('errors.location.unsupportedBrowser'));
            }
        });
    }
}

export let geolocationServiceInjectables: Array<any> = [
    {provide: GeoLocationService, useClass: GeoLocationService }
];
