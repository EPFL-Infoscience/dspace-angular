import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { RequestService } from '../../core/data/request.service';
import { map, shareReplay } from 'rxjs/operators';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { UploaderOptions } from '../../shared/uploader/uploader-options.model';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'ds-admin-language-files',
  templateUrl: './admin-language-files.component.html',
  styleUrls: ['./admin-language-files.component.scss']
})
export class AdminLanguageFilesComponent implements OnInit {

  fileObj = new Map<string, File>();

  availableLanguages = environment.languages;

  labelPrefix = 'admin.language-labels';

  uploadFilesEndpoint$: Observable<string>;

  constructor(
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
    protected requestService: RequestService,
    private halService: HALEndpointService,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {

    this.uploadFilesEndpoint$ = this.halService.getEndpoint('adminfile').pipe(
      shareReplay(),
    );

  }

  setFile($event: File, langCode: string) {
    this.fileObj.set(langCode, $event);
  }

  getLabel(value: string): string {
    return `${this.labelPrefix}.${value}`;
  }

  getTranslation(value: string, params?: any): Observable<string> {
    return this.translate.get(`${this.labelPrefix}.${value}`, params);
  }

  uploadFilesOptions(langCode: string): Observable<UploaderOptions> {
    return this.uploadFilesEndpoint$.pipe(
      map((endpointURL) => Object.assign(new UploaderOptions(), {
          url: `${endpointURL}?lang=${langCode}`,
          authToken: this.authService.buildAuthHeader(),
          maxFileNumber: 1,
        }),
      ),
    );
  }

  onCompleteItem($event: any, langName: string) {
    if ($event.status === 200) {
      this.uploadNotificationSuccess(langName);
    }
  }

  onUploadError($event: any, langName: string) {
    this.uploadNotificationError(langName);
  }

  uploadNotificationSuccess(langName: string) {
    this.notificationsService.success(
      this.getTranslation('notification.upload-success.title'),
      this.getTranslation('notification.upload-success.content', {langName})
    );
  }

  uploadNotificationError(langName: string) {
    this.notificationsService.error(
      this.getTranslation('notification.upload-error.title'),
      this.getTranslation('notification.upload-error.content', {langName})
    );
  }
}
