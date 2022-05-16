import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { SearchService } from '../../../../core/shared/search/search.service';
import { TranslateLoaderMock } from '../../../mocks/translate-loader.mock';
import { CarouselSectionComponent } from './carousel-section.component';
import { SearchResult } from '../../../search/models/search-result.model';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { createSuccessfulRemoteDataObject, createSuccessfulRemoteDataObject$ } from '../../../remote-data.utils';
import { ObjectCacheService } from 'src/app/core/cache/object-cache.service';
import { UUIDService } from 'src/app/core/shared/uuid.service';
import { RemoteDataBuildService } from 'src/app/core/cache/builders/remote-data-build.service';
import { HALEndpointService } from 'src/app/core/shared/hal-endpoint.service';
import { Store } from '@ngrx/store';
import { NotificationsServiceStub } from 'src/app/shared/testing/notifications-service.stub';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { DSOChangeAnalyzer } from 'src/app/core/data/dso-change-analyzer.service';
import { DefaultChangeAnalyzer } from 'src/app/core/data/default-change-analyzer.service';
import { Item } from 'src/app/core/shared/item.model';
import { Observable } from 'rxjs';
import { RemoteData } from 'src/app/core/data/remote-data';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { BitstreamDataService } from 'src/app/core/data/bitstream-data.service';
import { NativeWindowRef, NativeWindowService } from 'src/app/core/services/window.service';
import { FindListOptions } from 'src/app/core/data/request.models';
import { FollowLinkConfig } from 'src/app/shared/utils/follow-link-config.model';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { createPaginatedList } from 'src/app/shared/testing/utils.test';
import { cold } from 'jasmine-marbles';

describe('CarouselSectionComponent', () => {
    let component: CarouselSectionComponent;
    let fixture: ComponentFixture<CarouselSectionComponent>;

    let searchServiceStub: any;
    let notificationService: NotificationsServiceStub;

    const mockBitstreamDataService = jasmine.createSpyObj('bitstreamDataService', {
        getThumbnailFor(item: Item): Observable<RemoteData<Bitstream>> {
            return createSuccessfulRemoteDataObject$(new Bitstream());
        },
        findAllByItemAndBundleName(item: Item, bundleName: string, options?: FindListOptions, ...linksToFollow: FollowLinkConfig<Bitstream>[]): Observable<RemoteData<PaginatedList<Bitstream>>> {
            return createSuccessfulRemoteDataObject$(createPaginatedList([mockBitstream1]));
        },
    });

    const firstSearchResult = Object.assign(new SearchResult(), {
        indexableObject: Object.assign(new DSpaceObject(), {
            id: 'd317835d-7b06-4219-91e2-1191900cb897',
            uuid: 'd317835d-7b06-4219-91e2-1191900cb897',
            name: 'My first person',
            metadata: {
                'dc.title': [
                    { value: 'Test' }
                ],
                'dc.description.abstract': [
                    { value: 'Lorem Ipsum' }
                ]
            },
            _links: {
              content: { href: 'file-selflink' }
            }
        })
    });

    const secondSearchResult = Object.assign(new SearchResult(), {
        indexableObject: Object.assign(new DSpaceObject(), {
            id: 'd317835d-7b06-4219-91e2-1191900cb897',
            uuid: 'd317835d-7b06-4219-91e2-1191900cb897',
            name: 'My first person',
            metadata: {},
            _links: {
              content: { href: 'file-selflink' }
            }
        })
    });

    const mockBitstream1: Bitstream = Object.assign(new Bitstream(),
    {
      sizeBytes: 10201,
      bundleName: 'ORIGINAL',
      _links: {
        self: {
          href: 'https://dspace7.4science.it/dspace-spring-rest/api/core/bitstreams/cf9b0c8e-a1eb-4b65-afd0-567366448713'
        },
        content: {
          href: 'https://dspace7.4science.it/dspace-spring-rest/api/core/bitstreams/cf9b0c8e-a1eb-4b65-afd0-567366448713/content'
        }
      },
      id: 'cf9b0c8e-a1eb-4b65-afd0-567366448713',
      uuid: 'cf9b0c8e-a1eb-4b65-afd0-567366448713',
      type: 'bitstream',
      metadata: {
        'dc.title': [
          {
            value: 'test_word.jpg'
          }
        ]
      }
    });

    const mockBitstream2: Bitstream = Object.assign(new Bitstream(),
    {
      sizeBytes: 10201,
      bundleName: 'ORIGINAL',
      _links: {
        self: {
          href: 'https://dspace7.4science.it/dspace-spring-rest/api/core/bitstreams/cf9b0c8e-a1eb-4b65-afd0-567366448713'
        },
        content: {
          href: 'https://dspace7.4science.it/dspace-spring-rest/api/core/bitstreams/cf9b0c8e-a1eb-4b65-afd0-567366448713/content'
        }
      },
      id: 'cf9b0c8e-a1eb-4b65-afd0-567366448713',
      uuid: 'cf9b0c8e-a1eb-4b65-afd0-567366448713',
      type: 'bitstream',
      metadata: {
        'dc.title': [
          {
            value: 'test_word.docx'
          }
        ]
      }
    });

    const searchResultRD = createSuccessfulRemoteDataObject({ page: [firstSearchResult] });

    beforeEach(waitForAsync(() => {
        searchServiceStub = jasmine.createSpyObj('SearchService', {
            search: jasmine.createSpy('search'),
            getSearchLink: jasmine.createSpy('getSearchLink')
        });

        notificationService = new NotificationsServiceStub();
        TestBed.configureTestingModule({
            imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule, BrowserModule, RouterTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateLoaderMock
                    }
                }),
            ],
            declarations: [CarouselSectionComponent],
            providers: [
                CarouselSectionComponent,
                { provide: SearchService, useValue: searchServiceStub },
                { provide: ObjectCacheService, useValue: {} },
                { provide: UUIDService, useValue: {} },
                { provide: Store, useValue: {} },
                { provide: RemoteDataBuildService, useValue: {} },
                { provide: HALEndpointService, useValue: {} },
                { provide: NotificationsService, useValue: notificationService },
                { provide: HttpClient, useValue: {} },
                { provide: DSOChangeAnalyzer, useValue: {} },
                { provide: DefaultChangeAnalyzer, useValue: {} },
                { provide: BitstreamDataService, useValue: mockBitstreamDataService },
                { provide: NativeWindowService, useValue: new NativeWindowRef() },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselSectionComponent);
        component = fixture.componentInstance;
        mockBitstreamDataService.findAllByItemAndBundleName.and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([mockBitstream1])));
        searchServiceStub.search.and.returnValue(createSuccessfulRemoteDataObject$({ page: [firstSearchResult] }));
        searchServiceStub.getSearchLink.and.returnValue('/search');
        component.sectionId = 'persons';
        component.carouselSection = {
            discoveryConfigurationName: 'person',
            style: 'col-md-12',
            title: 'dc.title',
            link: '',
            description: 'dc.description.abstract',
            componentType: 'carousel'
          };

        fixture.detectChanges();
    });

    it('should create CarouselSectionComponent', inject([CarouselSectionComponent], (comp: CarouselSectionComponent) => {
        expect(comp).toBeDefined();
    }));

    it('should init search results data properly', (done) => {
        const expected = cold('(a|)', { a: searchResultRD });
        expect(component.searchResults).toBeObservable(expected);
        done();
    });

    it('should render title', (done) => {
        const title = fixture.debugElement.queryAll(By.css('#carouselObjTitle'));
        expect(title.length).toBe(1);
        done();
    });

    it('should render description', (done) => {
        const desc = fixture.debugElement.queryAll(By.css('#carouselObjDesc'));
        expect(desc.length).toBe(1);
        done();
    });

    it('should render image', (done) => {
        const image = fixture.debugElement.queryAll(By.css('.picsum-img-wrapper'));
        expect(image.length).toBe(1);
        done();
    });

    describe('when no data', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(CarouselSectionComponent);
            component = fixture.componentInstance;
            mockBitstreamDataService.findAllByItemAndBundleName.and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([mockBitstream2])));
            searchServiceStub.search.and.returnValue(createSuccessfulRemoteDataObject$({ page: [secondSearchResult] }));
            searchServiceStub.getSearchLink.and.returnValue('/search');
            component.sectionId = 'persons';
            component.carouselSection = {
                discoveryConfigurationName: 'person',
                style: 'col-md-12',
                title: 'dc.title',
                link: '',
                description: 'dc.description.abstract',
                componentType: 'carousel'
            };

            fixture.detectChanges();
        });

        it('should not render title', (done) => {
            const title = fixture.debugElement.queryAll(By.css('#carouselObjTitle'));
            expect(title.length).toBe(0);
            done();
        });

        it('should not render description', (done) => {
            const desc = fixture.debugElement.queryAll(By.css('#carouselObjDesc'));
            expect(desc.length).toBe(0);
            done();
        });

        it('should not render image', (done) => {
            const image = fixture.debugElement.queryAll(By.css('.picsum-img-wrapper'));
            expect(image.length).toBe(0);
            done();
        });
    });

});
