import { Component, ElementRef, Input, OnInit } from '@angular/core';
import {
  LocationCoordinates,
  LocationErrorCodes,
  LocationPlace,
  LocationService
} from '../../core/services/location.service';
import { filter, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { isNotEmpty } from '../empty.util';
import { latLng, LatLng, Layer, MapOptions, marker, tileLayer } from 'leaflet';


export interface OpenStreetMapPointer {
  coordinates: LocationCoordinates,
  color: string,
}

@Component({
  selector: 'ds-open-street-map',
  templateUrl: './open-street-map.component.html',
  styleUrls: ['./open-street-map.component.scss'],
})
export class OpenStreetMapComponent implements OnInit {

  // Spacial reference identifier
  SRID = 'EPSG:4326'; // World Geodetic System 1984

  /**
   * The width of the map
   */
  @Input() width?: string;

  /**
   * The height of the map
   */
  @Input() height?: string;

  /**
   * The map coordinates
   */
  @Input() coordinates: string;

  /**
   * The name of the location
   */
  @Input() displayName: string;

  /**
   * The CSS classes to be applied to the location name, which is shown below the map
   */
  @Input() displayNameClass: string;

  /**
   * Show zoom controls on the map
   */
  @Input() showControlsZoom = true;

  /**
   * The name of the location
   */
  @Input() showDisplayName = false;

  /**
   * The coordinates of the place once retrieved by the location service
   */
  coordinates$: Observable<LocationCoordinates>;

  /**
   * The name of the address to display
   */
  displayName$: Observable<string>;

  /**
   * Contains error codes from the location service
   */
  invalidLocationErrorCode: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * The place to be shown in the map
   */
  place = new BehaviorSubject<LocationPlace>(undefined);

  /**
   * The styles that are being applied to the map container
   */
  mapStyle: {[key: string]: string} = {};

  /**
   * The center of the map
   */
  leafletCenter: LatLng;

  /**
   * The zoom level of the map
   */
  leafletZoom = 14;

  /**
   * The layers of the map
   */
  leafletLayers: Layer[] = [];

  /**
   * The options for the map
   */
  leafletOptions: MapOptions = {
    // attribution is still needed
    // attributionControl: false,
    zoomControl: this.showControlsZoom
  };

  constructor(
    protected translateService: TranslateService,
    private locationService: LocationService,
    protected elementRef: ElementRef) {
  }

  ngOnInit(): void {

    this.mapStyle = {
      width: this.width || '100%',
      height: this.height || `${(+this.width || this.elementRef.nativeElement.parentElement.offsetWidth) / 2}px`
    };

    this.coordinates$ = this.place.asObservable().pipe(
      filter((place) => isNotEmpty(place)),
      map((place) => place.coordinates),
      tap(coordinates => this.setCenterAndPointer(coordinates))
    );

    this.displayName$ = this.place.asObservable().pipe(
      filter((place) => isNotEmpty(place)),
      map((place) => place.displayName),
    );

    if (this.locationService.isCoordinateString(this.coordinates)) {

      // Validate the coordinates, then retrieve the location name

      if (this.locationService.isValidCoordinateString(this.coordinates)) {
        const coordinates = this.locationService.parseCoordinates(this.coordinates);
        this.locationService.searchCoordinates(coordinates).subscribe({
          next: (displayName) => {
            const place: LocationPlace = {
              coordinates: coordinates,
              displayName: displayName, // Show the name retrieved from Nominatim
            };
            this.place.next(place);
          },
          error: (err) => {
            // show the map centered on provided coordinates despite the possibility to retrieve a description for the place
            const place: LocationPlace = {
              coordinates: coordinates,
            };
            this.place.next(place);
            if (err.message === LocationErrorCodes.API_ERROR) {
              console.error(err.message);
            } else {
              console.warn(err.message);
            }
          },
        });
      } else {
        console.error(`Invalid coordinates: "${this.coordinates}"`);
        this.invalidLocationErrorCode.next(LocationErrorCodes.INVALID_COORDINATES);
      }

    } else {

      // Retrieve the coordinates for the provided POI or address

      this.locationService.searchPlace(this.coordinates).subscribe({
        next: (place) => {
          place.displayName = this.coordinates; // Show the name stored in metadata (comment out to show name retrieved from Nominatim)
          this.place.next(place);
        },
        error: (err) => {
          this.invalidLocationErrorCode.next(err.message); // either LOCATION_NOT_FOUND or API_ERROR
          if (err.message === LocationErrorCodes.API_ERROR) {
            console.error(err.message);
          } else {
            console.warn(err.message);
          }
        },
      });
    }

  }

  private setCenterAndPointer(coordinates: LocationCoordinates) {
    this.leafletCenter = latLng(coordinates.latitude, coordinates.longitude);
    this.leafletLayers = [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: 'Leaflet'}),
      marker([coordinates.latitude, coordinates.longitude])
    ];
  }
}
