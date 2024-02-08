import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OpenStreetMapsComponent } from './open-street-maps.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GeoLocationService } from 'src/app/core/geo-location/geo-location.service';
import { TranslateModule } from '@ngx-translate/core';

describe('OpenStreetMapsComponent', () => {
  let component: OpenStreetMapsComponent;
  let fixture: ComponentFixture<OpenStreetMapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpenStreetMapsComponent],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [GeoLocationService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenStreetMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

});
