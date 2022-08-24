import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { RequestService } from '../../core/data/request.service';
import { map } from 'rxjs/operators';
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

  uploadFilesOptions$: Observable<UploaderOptions>;

  constructor(
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
    protected requestService: RequestService,
    private halService: HALEndpointService,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {

    this.uploadFilesOptions$ = this.halService.getEndpoint('adminfile').pipe(
      map((endpointURL) => Object.assign(new UploaderOptions(), {
        url: endpointURL,
        authToken: this.authService.buildAuthHeader(),
        maxFileNumber: 1,
      }))
    );

  }

  doSomething($event?: any) {
    this.notificationsService.info('TEST', 'test');
    console.log($event);
  }

  setFile($event: File, langCode: string) {
    this.fileObj.set(langCode, $event);
  }

  getLabel(value: string): string {
    return `${this.labelPrefix}.${value}`;
  }

  getTranslation(value: string): Observable<string> {
    return this.translate.get(`${this.labelPrefix}.${value}`);
  }

}
