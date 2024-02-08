import { Component, OnInit } from '@angular/core';

import { FieldRenderingType, MetadataBoxFieldRendering, } from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

@Component({
  selector: 'ds-osmap',
  templateUrl: './osmap.component.html',
  styleUrls: ['./osmap.component.scss'],
})
@MetadataBoxFieldRendering(FieldRenderingType.OSMAP)
export class OsmapComponent extends RenderingTypeValueModelComponent implements OnInit {
  coordinates: string[];
  latitude: number;
  longitude: number;

  ngOnInit(): void {
    this.coordinates = this.metadataValue.value.split(',');
    this.latitude = +this.coordinates[0];
    this.longitude = +this.coordinates[1];
  }

}
