import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { proj } from 'openlayers';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { GeoLocationService } from 'src/app/core/geo-location/geo-location.service';

@Component({
  selector: 'ds-open-street-maps',
  templateUrl: './open-street-maps.component.html',
  styleUrls: ['./open-street-maps.component.scss'],
  providers: [HttpClient, GeoLocationService]
})
export class OpenStreetMapsComponent implements OnInit, OnDestroy {
  @Input() geoReverseService = 'https://nominatim.openstreetmap.org/reverse?key=iTzWSiYpGxDvhATNtSrqx5gDcnMOkntL&format=json&addressdetails=1&lat={lat}&lon={lon}';

  @Input() width: string;
  @Input() height: string;

  @Input() latitude: number;
  @Input() longitude: number;

  @Input() latitudePointer: number;
  @Input() longitudePointer: number;

  @Input() showControlsZoom = true;
  @Input() showControlsCurrentLocation = true;
  @Input() showDebugInfo = false;

  @Input() opacity = 1;
  @Input() zoom = 14;

  reverseGeoSub: Subscription = null;
  pointedAddress: string;
  pointedAddressOrg: string;
  position: any;
  dirtyPosition;

  constructor(
    private httpClient: HttpClient,
    private geoLocationService: GeoLocationService,
  ) {
  }

  ngOnInit() {
    if (this.showControlsCurrentLocation) {
      this.geoLocationService.getLocation().subscribe((position) => {
        this.position = position;
        if (!this.dirtyPosition) {
          this.dirtyPosition = true;
          this.longitude = this.longitudePointer = this.position.coords.longitude;
          this.latitude = this.latitudePointer = this.position.coords.latitude;
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.reverseGeoSub) {
      this.reverseGeoSub.unsubscribe();
    }
  }

  onSingleClick(event) {
    const lonlat = proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
    this.longitudePointer = lonlat[0];
    this.latitudePointer = lonlat[1];
    this.reverseGeo();
  }

  increaseOpacity() {
    this.opacity += 0.1;
  }

  decreaseOpacity() {
    this.opacity -= 0.1;
  }

  increaseZoom() {
    this.zoom++;
  }

  decreaseZoom() {
    this.zoom--;
  }

  setCurrentLocation(event) {
    // TODO FIX: setting current location does move the pointer but not the map!!!
    if (this.position) {
      this.longitude = this.longitudePointer = this.position.coords.longitude;
      this.latitude = this.latitudePointer = this.position.coords.latitude;
      /**
       * Trigger new address change
       */
      this.reverseGeo();
    }
  }

  reverseGeo() {
    const service = (this.geoReverseService || '')
      .replace(new RegExp('{lon}', 'ig'), `${this.longitudePointer}`)
      .replace(new RegExp('{lat}', 'ig'), `${this.latitudePointer}`);
    this.reverseGeoSub = this.httpClient.get(service).subscribe(data => {
      const val = (data || {});

      this.pointedAddressOrg = (val as any).display_name;
      const addressParts = {
        building: ['building', 'mall', 'theatre'],
        zipCity: ['postcode', 'city'],
        streetNumber: ['street', 'road', 'footway', 'pedestrian', 'house_number']
      };

      const address = [];

      for (const [key, value] of Object.entries(addressParts)) {
        const part = [];
        for (const property of value) {
          if ((val as any).address[property]) {
            part.push((val as any).address[property]);
          }
        }
        if (part.length) {
          address.push(part.join(' '));
        }
      }

      this.pointedAddress = address.join(', ');
    });
  }
}
