import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationDataService } from './../../core/data/configuration-data.service';
import { DeduplicationItemsService } from './deduplication-items.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'src/app/core/services/cookie.service';
import { CookieServiceMock } from 'src/app/shared/mocks/cookie.service.mock';

import { DeduplicationMergeComponent } from './deduplication-merge.component';
import { GetBitstreamsPipe } from './pipes/ds-get-bitstreams.pipe';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { ActivatedRoute } from '@angular/router';
import { MockActivatedRoute } from 'src/app/shared/mocks/active-router.mock';
import { ChangeDetectorRef } from '@angular/core';

describe('DeduplicationMergeComponent', () => {
  let component: DeduplicationMergeComponent;
  let fixture: ComponentFixture<DeduplicationMergeComponent>;

  const configurationDataService = jasmine.createSpyObj('configurationDataService', {
    findByPropertyName: createSuccessfulRemoteDataObject$({ values: ['https://sandbox.orcid.org'] })
  });

  const mockCdRef = Object.assign({
    detectChanges: () => fixture.detectChanges()
  });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeduplicationMergeComponent],
      providers: [
        { provide: CookieService, useValue: new CookieServiceMock() },
        { provide: DeduplicationItemsService, useValue: {} },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: ActivatedRoute, useValue: new MockActivatedRoute() },
        { provide: Location, useValue: location },
        { provide: ChangeDetectorRef, useValue: mockCdRef },
        {
          provide: NgbModal, useValue: {
            open: () => {/*comment*/
            }
          }
        },
        GetBitstreamsPipe
      ],
      imports:[
        TranslateModule.forRoot(),
        NgbModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeduplicationMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
