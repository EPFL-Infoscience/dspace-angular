import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule, makeStateKey, TransferState } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { REQUEST } from '@nguniversal/express-engine/tokens';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateBrowserLoader } from '../../ngx-translate-loaders/translate-browser.loader';

import { IdlePreloadModule } from 'angular-idle-preload';

import { AppComponent } from '../../app/app.component';

import { AppModule } from '../../app/app.module';
import { ClientCookieService } from '../../app/core/services/client-cookie.service';
import { CookieService } from '../../app/core/services/cookie.service';
import { AuthService } from '../../app/core/auth/auth.service';
import { Angulartics2GoogleTagManager, Angulartics2RouterlessModule } from 'angulartics2';
import { SubmissionService } from '../../app/submission/submission.service';
import { StatisticsModule } from '../../app/statistics/statistics.module';
import { BrowserKlaroService } from '../../app/shared/cookies/browser-klaro.service';
import { KlaroService } from '../../app/shared/cookies/klaro.service';
import { HardRedirectService } from '../../app/core/services/hard-redirect.service';
import {
  BrowserHardRedirectService,
  locationProvider,
  LocationToken
} from '../../app/core/services/browser-hard-redirect.service';
import { LocaleService } from '../../app/core/locale/locale.service';
import { GoogleAnalyticsService } from '../../app/statistics/google-analytics.service';
import { AuthRequestService } from '../../app/core/auth/auth-request.service';
import { BrowserAuthRequestService } from '../../app/core/auth/browser-auth-request.service';
import { BrowserInitService } from './browser-init.service';
import { ReferrerService } from '../../app/core/services/referrer.service';
import { BrowserXSRFService } from '../../app/core/xsrf/browser-xsrf.service';
import { XSRFService } from '../../app/core/xsrf/xsrf.service';
import { BrowserReferrerService } from '../../app/core/services/browser.referrer.service';
import { MathService } from '../../app/core/shared/math.service';
import { ClientMathService } from '../../app/core/shared/client-math.service';
import { SvgIconLoaderService } from '../../themes/infoscience/app/svg-icon/svg-icon-loader.service';
import { ClientSvgIconLoaderService } from '../../themes/infoscience/app/svg-icon/client-svg-icon-loader.service';
import { DatadogRumService } from '../../app/shared/datadog-rum/datadog-rum.service';
import { BrowserDatadogRumService } from '../../app/shared/datadog-rum/browser-datadog-rum.service';

export const REQ_KEY = makeStateKey<string>('req');

export function createTranslateLoader(transferState: TransferState, http: HttpClient) {
  return new TranslateBrowserLoader(transferState, http, 'assets/i18n/', '.json');
}

export function getRequest(transferState: TransferState): any {
  return transferState.get<any>(REQ_KEY, {});
}

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({
      appId: 'dspace-angular'
    }),
    HttpClientModule,
    // forRoot ensures the providers are only created once
    IdlePreloadModule.forRoot(),
    StatisticsModule.forRoot(),
    Angulartics2RouterlessModule.forRoot(),
    BrowserAnimationsModule,
    BrowserTransferStateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [TransferState, HttpClient]
      }
    }),
    AppModule
  ],
  providers: [
    ...BrowserInitService.providers(),
    {
      provide: REQUEST,
      useFactory: getRequest,
      deps: [TransferState]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (xsrfService: XSRFService, httpClient: HttpClient) => xsrfService.initXSRFToken(httpClient),
      deps: [ XSRFService, HttpClient ],
      multi: true,
    },
    {
      provide: XSRFService,
      useClass: BrowserXSRFService,
    },
    {
      provide: AuthService,
      useClass: AuthService
    },
    {
      provide: CookieService,
      useClass: ClientCookieService
    },
    {
      provide: KlaroService,
      useClass: BrowserKlaroService
    },
    {
      provide: DatadogRumService,
      useClass: BrowserDatadogRumService
    },
    {
      provide: SubmissionService,
      useClass: SubmissionService
    },
    {
      provide: LocaleService,
      useClass: LocaleService
    },
    {
      provide: HardRedirectService,
      useClass: BrowserHardRedirectService,
    },
    {
      provide: GoogleAnalyticsService,
      useClass: GoogleAnalyticsService,
    },
    {
      provide: Angulartics2GoogleTagManager,
      useClass: Angulartics2GoogleTagManager
    },
    {
      provide: AuthRequestService,
      useClass: BrowserAuthRequestService,
    },
    {
      provide: ReferrerService,
      useClass: BrowserReferrerService,
    },
    {
      provide: LocationToken,
      useFactory: locationProvider,
    },
    {
      provide: MathService,
      useClass: ClientMathService
    },
    {
      provide: SvgIconLoaderService,
      useClass: ClientSvgIconLoaderService
    }
  ]
})
export class BrowserAppModule {
}
