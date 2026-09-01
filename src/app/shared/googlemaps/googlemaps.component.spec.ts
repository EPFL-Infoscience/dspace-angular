import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfigurationDataService } from '../../core/data/configuration-data.service';
import { createSuccessfulRemoteDataObject$ } from '../remote-data.utils';
import { GooglemapsComponent } from './googlemaps.component';

describe('GooglemapsComponent', () => {

  let component: GooglemapsComponent;

  let fixture: ComponentFixture<GooglemapsComponent>;
  let originalNgOnInit: any;

  const coordinates = '@41.3455,456.67';

  const configurationDataService = jasmine.createSpyObj('configurationDataService', {
    findByPropertyName: jasmine.createSpy('findByPropertyName')
  });

  const confResponse$ = createSuccessfulRemoteDataObject$({ values: ['valid-googlemap-key'] });

  // Patch ngOnInit on the prototype to prevent any instance from loading
  // the real Google Maps script and calling google.maps APIs during tests.
  // Patching loadScript alone is insufficient because a resolved promise still
  // triggers loadMap → mapInitializer → google.maps.Map (undefined in tests).
  beforeAll(() => {
    originalNgOnInit = GooglemapsComponent.prototype.ngOnInit;
    GooglemapsComponent.prototype.ngOnInit = function() { /* noop */ };
  });

  afterAll(() => {
    GooglemapsComponent.prototype.ngOnInit = originalNgOnInit;
    document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach(el => el.remove());
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GooglemapsComponent ],
      providers: [
      { provide: ConfigurationDataService, useValue: configurationDataService },
      ]
    })
    .compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(GooglemapsComponent);
    component = fixture.componentInstance;
    component.coordinates = coordinates;
    configurationDataService.findByPropertyName.and.returnValues(confResponse$);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render google map.',() => {
    const container = fixture.debugElement.query(By.css('.map-container'));
    expect(container).toBeTruthy();
  });

  it('should not render google map if coordinates are not valid.',() => {
    fixture = TestBed.createComponent(GooglemapsComponent);
    component = fixture.componentInstance;
    component.coordinates = '';
    const container = fixture.debugElement.query(By.css('.map-container'));
    expect(container).toBeFalsy();
  });

  it('should not render google map if the google maps api key is not present.',() => {
    fixture = TestBed.createComponent(GooglemapsComponent);
    component = fixture.componentInstance;
    component.coordinates = coordinates;
    component.noKeyConfigured = true;
    const container = fixture.debugElement.query(By.css('.map-container'));
    expect(container).toBeFalsy();
  });
});
