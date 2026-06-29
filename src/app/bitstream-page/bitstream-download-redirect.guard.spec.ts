import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of as observableOf } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { AuthorizationDataService } from '../core/data/feature-authorization/authorization-data.service';
import { FileService } from '../core/shared/file.service';
import { HardRedirectService } from '../core/services/hard-redirect.service';
import { Bitstream } from '../core/shared/bitstream.model';
import { getForbiddenRoute } from '../app-routing-paths';
import { PLATFORM_ID } from '@angular/core';
import { NativeWindowRef, NativeWindowService } from '../core/services/window.service';
import { bitstreamDownloadRedirectGuard } from './bitstream-download-redirect.guard';
import { ObjectCacheService } from '../core/cache/object-cache.service';
import { UUIDService } from '../core/shared/uuid.service';
import { Store } from '@ngrx/store';
import { RemoteDataBuildService } from '../core/cache/builders/remote-data-build.service';
import { HALEndpointService } from '../core/shared/hal-endpoint.service';
import { DSOChangeAnalyzer } from '../core/data/dso-change-analyzer.service';
import { BitstreamFormatDataService } from '../core/data/bitstream-format-data.service';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { BitstreamDataService } from '../core/data/bitstream-data.service';
import { createSuccessfulRemoteDataObject$ } from '../shared/remote-data.utils';

describe('BitstreamDownloadRedirectGuard', () => {
  let resolver: any;

  let authService: AuthService;
  let authorizationService: AuthorizationDataService;
  let bitstreamDataService: BitstreamDataService;
  let fileService: FileService;
  let halEndpointService: HALEndpointService;
  let hardRedirectService: HardRedirectService;
  let remoteDataBuildService: RemoteDataBuildService;
  let uuidService: UUIDService;
  let objectCacheService: ObjectCacheService;
  let router: Router;
  let store: Store;
  let bitstream: Bitstream;

  let route = {
    params: {},
    queryParams: {}
  };
  let state = {};
  let navigationExtras = {};

  function init() {
    route = {
      params: {},
      queryParams: {},
    };
    navigationExtras = {};

    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: observableOf(true),
      setRedirectUrl: {}
    });
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: observableOf(true),
    });

    fileService = jasmine.createSpyObj('fileService', {
      retrieveSignedUrl: observableOf(null),
      retrieveFileDownloadLink: observableOf('content-url-with-token'),
    });

    hardRedirectService = jasmine.createSpyObj('hardRedirectService', {
      redirect: {},
    });

    halEndpointService = jasmine.createSpyObj('halEndpointService', {
      getEndpoint: observableOf('https://rest.api/core')
    });

    remoteDataBuildService = jasmine.createSpyObj('remoteDataBuildService', {
      buildSingle: observableOf(new Bitstream())
    });

    uuidService = jasmine.createSpyObj('uuidService', {
      generate: 'test-id'
    });

    bitstream = Object.assign(new Bitstream(), {
      uuid: 'bitstreamUuid',
      _links: {
        content: {href: 'bitstream-content-link'},
        self: {href: 'bitstream-self-link'},
      }
    });

    router = jasmine.createSpyObj('router', ['navigateByUrl', 'createUrlTree', 'getCurrentNavigation']);
    (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
      extras: navigationExtras,
    });

    store = jasmine.createSpyObj('store', {
      dispatch: {},
      pipe: observableOf(true)
    });

    objectCacheService = jasmine.createSpyObj('objectCacheService', {
      getByHref: observableOf(null)
    });

    bitstreamDataService = jasmine.createSpyObj('bitstreamDataService', {
      findById: createSuccessfulRemoteDataObject$(Object.assign(new Bitstream(), {
        _links: {
          content: {href: 'bitstream-content-link'},
          self: {href: 'bitstream-self-link'},
        },
      }))
    });

    resolver = bitstreamDownloadRedirectGuard;
  }

  function initTestbed() {
    TestBed.configureTestingModule({
      providers: [
        {provide: NativeWindowService, useValue: new NativeWindowRef()},
        {provide: Router, useValue: router},
        {provide: AuthorizationDataService, useValue: authorizationService},
        {provide: AuthService, useValue: authService},
        {provide: FileService, useValue: fileService},
        {provide: HardRedirectService, useValue: hardRedirectService},
        {provide: ObjectCacheService, useValue: objectCacheService},
        {provide: PLATFORM_ID, useValue: 'server'},
        {provide: UUIDService, useValue: uuidService},
        {provide: Store, useValue: store},
        {provide: RemoteDataBuildService, useValue: remoteDataBuildService},
        {provide: HALEndpointService, useValue: halEndpointService},
        {provide: DSOChangeAnalyzer, useValue: {}},
        {provide: BitstreamFormatDataService, useValue: {}},
        {provide: NotificationsService, useValue: {}},
        {provide: BitstreamDataService, useValue: bitstreamDataService},
      ]
    });
  }

  describe('bitstream retrieval', () => {
    describe('when the user is authorized and logged in', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: {} };
        initTestbed();
      });
      it('should redirect to download link and return true', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('content-url-with-token', null, true);
            expect(result).toBeTrue();
          });
        });
      }));
    });

    describe('when the user is authorized but not logged in', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: {} };
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(false));
        initTestbed();
      });
      it('should redirect to plain content url and return true', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('bitstream-content-link', null, true);
            expect(result).toBeTrue();
          });
        });
      }));

      it('should redirect using access token when present', waitForAsync(() => {
        route = { ...route, queryParams: { accessToken: 'token' } };
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('bitstream-content-link?accessToken=token', null, true);
            expect(result).toBeTrue();
          });
        });
      }));
    });

    describe('when the user is not authorized and logged in', () => {
      beforeEach(() => {
        init();
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
        initTestbed();
      });
      it('should navigate to the forbidden route', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe(() => {
            expect(router.createUrlTree).toHaveBeenCalledWith([getForbiddenRoute()]);
          });
        });
      }));
    });

    describe('when the user is not authorized and not logged in', () => {
      beforeEach(() => {
        init();
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(false));
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
        initTestbed();
      });
      it('should navigate to the login page', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe(() => {
            expect(authService.setRedirectUrl).toHaveBeenCalled();
            expect(router.createUrlTree).toHaveBeenCalledWith(['login']);
          });
        });
      }));
    });

    describe('when the user is authorized and a signed URL is available', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: {} };
        bitstreamDataService = jasmine.createSpyObj('bitstreamDataService', {
          findById: createSuccessfulRemoteDataObject$(Object.assign(new Bitstream(), {
            _links: {
              content: { href: 'bitstream-content-link' },
              signedurl: { href: 'bitstream-signedurl-link' },
              self: { href: 'bitstream-self-link' },
            },
          })),
        });
        (fileService.retrieveSignedUrl as jasmine.Spy).and.returnValue(observableOf('https://s3.example.com/file?sig=xyz'));
        initTestbed();
        TestBed.overrideProvider(BitstreamDataService, { useValue: bitstreamDataService });
      });
      it('should redirect to the signed URL and return true', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(fileService.retrieveSignedUrl).toHaveBeenCalledWith('bitstream-signedurl-link');
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('https://s3.example.com/file?sig=xyz');
            expect(result).toBeTrue();
          });
        });
      }));
    });
  });

  describe('blockResolvingBitstreamPageRoute parameter', () => {
    describe('when blockResolvingBitstreamPageRoute is true and user is authorized and logged in', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: { blockResolvingBitstreamPageRoute: true } };
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
          extras: navigationExtras,
        });
        initTestbed();
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should redirect to download link and return false (blocking route resolution)', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('content-url-with-token', null, true);
            expect(result).toBeFalse();
          });
        });
      }));
    });

    describe('when blockResolvingBitstreamPageRoute is false and user is authorized and logged in', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: { blockResolvingBitstreamPageRoute: false } };
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
          extras: navigationExtras,
        });
        initTestbed();
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should redirect to download link and return true (allowing route resolution)', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('content-url-with-token', null, true);
            expect(result).toBeTrue();
          });
        });
      }));
    });

    describe('when blockResolvingBitstreamPageRoute is true and user is not authorized with access token', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: { blockResolvingBitstreamPageRoute: true } };
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
          extras: navigationExtras,
        });
        route = { ...route, queryParams: { accessToken: 'token' } };
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
        initTestbed();
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should redirect with access token and return false (blocking route resolution)', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('bitstream-content-link?accessToken=token', null, true);
            expect(result).toBeFalse();
          });
        });
      }));
    });

    describe('when blockResolvingBitstreamPageRoute is false and user is not authorized with access token', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: { blockResolvingBitstreamPageRoute: false } };
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
          extras: navigationExtras,
        });
        route = { ...route, queryParams: { accessToken: 'token' } };
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
        initTestbed();
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should redirect with access token and return true (allowing route resolution)', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('bitstream-content-link?accessToken=token', null, true);
            expect(result).toBeTrue();
          });
        });
      }));
    });

    describe('when blockResolvingBitstreamPageRoute is true and user is authorized with signed URL', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: { blockResolvingBitstreamPageRoute: true } };
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
          extras: navigationExtras,
        });
        bitstreamDataService = jasmine.createSpyObj('bitstreamDataService', {
          findById: createSuccessfulRemoteDataObject$(Object.assign(new Bitstream(), {
            _links: {
              content: { href: 'bitstream-content-link' },
              signedurl: { href: 'bitstream-signedurl-link' },
              self: { href: 'bitstream-self-link' },
            },
          })),
        });
        (fileService.retrieveSignedUrl as jasmine.Spy).and.returnValue(observableOf('https://s3.example.com/file?sig=xyz'));
        initTestbed();
        TestBed.overrideProvider(BitstreamDataService, { useValue: bitstreamDataService });
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should redirect to signed URL and return false (blocking route resolution)', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(fileService.retrieveSignedUrl).toHaveBeenCalledWith('bitstream-signedurl-link');
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('https://s3.example.com/file?sig=xyz');
            expect(result).toBeFalse();
          });
        });
      }));
    });

    describe('when blockResolvingBitstreamPageRoute is false and user is authorized with signed URL', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: { blockResolvingBitstreamPageRoute: false } };
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
          extras: navigationExtras,
        });
        bitstreamDataService = jasmine.createSpyObj('bitstreamDataService', {
          findById: createSuccessfulRemoteDataObject$(Object.assign(new Bitstream(), {
            _links: {
              content: { href: 'bitstream-content-link' },
              signedurl: { href: 'bitstream-signedurl-link' },
              self: { href: 'bitstream-self-link' },
            },
          })),
        });
        (fileService.retrieveSignedUrl as jasmine.Spy).and.returnValue(observableOf('https://s3.example.com/file?sig=xyz'));
        initTestbed();
        TestBed.overrideProvider(BitstreamDataService, { useValue: bitstreamDataService });
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should redirect to signed URL and return true (allowing route resolution)', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(fileService.retrieveSignedUrl).toHaveBeenCalledWith('bitstream-signedurl-link');
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('https://s3.example.com/file?sig=xyz');
            expect(result).toBeTrue();
          });
        });
      }));
    });

    describe('when blockResolvingBitstreamPageRoute is true and user is authorized but not logged in', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: { blockResolvingBitstreamPageRoute: true } };
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
          extras: navigationExtras,
        });
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(false));
        initTestbed();
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should redirect to plain content url and return false (blocking route resolution)', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('bitstream-content-link', null, true);
            expect(result).toBeFalse();
          });
        });
      }));
    });

    describe('when blockResolvingBitstreamPageRoute is false and user is authorized but not logged in', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: { blockResolvingBitstreamPageRoute: false } };
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
          extras: navigationExtras,
        });
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(false));
        initTestbed();
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should redirect to plain content url and return true (allowing route resolution)', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('bitstream-content-link', null, true);
            expect(result).toBeTrue();
          });
        });
      }));
    });

    describe('when blockResolvingBitstreamPageRoute is undefined', () => {
      beforeEach(() => {
        init();
        navigationExtras = { state: {} };
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
          extras: navigationExtras,
        });
        initTestbed();
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should treat as false and redirect to download link and return true', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('content-url-with-token', null, true);
            expect(result).toBeTrue();
          });
        });
      }));
    });

    describe('when getCurrentNavigation returns null', () => {
      beforeEach(() => {
        init();
        (router.getCurrentNavigation as jasmine.Spy).and.returnValue(null);
        initTestbed();
        TestBed.overrideProvider(Router, { useValue: router });
      });
      it('should treat blockResolvingBitstreamPageRoute as false and return true', waitForAsync(() => {
        TestBed.runInInjectionContext(() => {
          resolver(route, state).subscribe((result) => {
            expect(hardRedirectService.redirect).toHaveBeenCalledWith('content-url-with-token', null, true);
            expect(result).toBeTrue();
          });
        });
      }));
    });
  });
});
