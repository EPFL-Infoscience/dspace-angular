import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule, TransferState } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import {
  Angulartics2,
  Angulartics2GoogleAnalytics,
  Angulartics2GoogleGlobalSiteTag
} from 'angulartics2';

import { AppComponent } from '../../app/app.component';

import { AppModule } from '../../app/app.module';
import { TranslateServerLoader } from '../../ngx-translate-loaders/translate-server.loader';
import { CookieService } from '../../app/core/services/cookie.service';
import { ServerCookieService } from '../../app/core/services/server-cookie.service';
import { AuthService } from '../../app/core/auth/auth.service';
import { ServerAuthService } from '../../app/core/auth/server-auth.service';
import { AngularticsProviderMock } from '../../app/shared/mocks/angulartics-provider.service.mock';
import { SubmissionService } from '../../app/submission/submission.service';
import { ServerSubmissionService } from '../../app/submission/server-submission.service';
import { Angulartics2DSpace } from '../../app/statistics/angulartics/dspace-provider';
import { ServerLocaleService } from '../../app/core/locale/server-locale.service';
import { LocaleService } from '../../app/core/locale/locale.service';
import { ForwardClientIpInterceptor } from '../../app/core/forward-client-ip/forward-client-ip.interceptor';
import { HardRedirectService } from '../../app/core/services/hard-redirect.service';
import { ServerHardRedirectService } from '../../app/core/services/server-hard-redirect.service';
import { Angulartics2Mock } from '../../app/shared/mocks/angulartics2.service.mock';
import { AuthRequestService } from '../../app/core/auth/auth-request.service';
import { ServerAuthRequestService } from '../../app/core/auth/server-auth-request.service';
import { ServerInitService } from './server-init.service';
import { XhrFactory } from '@angular/common';
import { ServerXhrService } from '../../app/core/services/server-xhr.service';
import { ServerXSRFService } from '../../app/core/xsrf/server-xsrf.service';
import { XSRFService } from '../../app/core/xsrf/xsrf.service';
import { ReferrerService } from '../../app/core/services/referrer.service';
import { ServerReferrerService } from '../../app/core/services/server.referrer.service';
import { MathService } from '../../app/core/shared/math.service';
import { ServerMathService } from '../../app/core/shared/server-math.service';
import { SvgIconLoaderService } from '../../themes/infoscience/app/svg-icon/svg-icon-loader.service';
import { ServerSvgIconLoaderService } from '../../themes/infoscience/app/svg-icon/server-svg-icon-loader.service';
import { DatadogRumService } from '../../app/shared/datadog-rum/datadog-rum.service';
import { ServerDatadogRumService } from '../../app/shared/datadog-rum/server-datadog-rum.service';

export function createTranslateLoader(transferState: TransferState) {
  return new TranslateServerLoader(transferState, 'dist/server/assets/i18n/', '.json');
}

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({
      appId: 'dspace-angular'
    }),
    NoopAnimationsModule,
    ServerTransferStateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [TransferState]
      }
    }),
    AppModule,
    ServerModule,
  ],
  providers: [
    ...ServerInitService.providers(),
    {
      provide: Angulartics2,
      useClass: Angulartics2Mock
    },
    {
      provide: Angulartics2GoogleAnalytics,
      useClass: AngularticsProviderMock
    },
    {
      provide: Angulartics2GoogleGlobalSiteTag,
      useClass: AngularticsProviderMock
    },
    {
      provide: Angulartics2DSpace,
      useClass: AngularticsProviderMock
    },
    {
      provide: AuthService,
      useClass: ServerAuthService
    },
    {
      provide: CookieService,
      useClass: ServerCookieService
    },
    {
      provide: SubmissionService,
      useClass: ServerSubmissionService
    },
    {
      provide: AuthRequestService,
      useClass: ServerAuthRequestService,
    },
    {
      provide: XSRFService,
      useClass: ServerXSRFService,
    },
    {
      provide: LocaleService,
      useClass: ServerLocaleService
    },
    // register ForwardClientIpInterceptor as HttpInterceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ForwardClientIpInterceptor,
      multi: true
    },
    {
      provide: HardRedirectService,
      useClass: ServerHardRedirectService,
    },
    {
      provide: XhrFactory,
      useClass: ServerXhrService,
    },
    {
      provide: ReferrerService,
      useClass: ServerReferrerService,
    },
    {
      provide: MathService,
      useClass: ServerMathService
    },
    {
      provide: DatadogRumService,
      useClass: ServerDatadogRumService
    },
    {
      provide: SvgIconLoaderService,
      useClass: ServerSvgIconLoaderService
    }
  ]
})
export class ServerAppModule {
}
