import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { RequestService } from '../../core/data/request.service';

@Component({
  selector: 'ds-admin-language-files',
  templateUrl: './admin-language-files.component.html',
  styleUrls: ['./admin-language-files.component.scss']
})
export class AdminLanguageFilesComponent {

  fileObj = new Map<string, File>();

  availableLanguages = environment.languages;

  labelPrefix = 'admin.language-labels';

  constructor(
      protected notificationsService: NotificationsService,
      protected translate: TranslateService,
      protected requestService: RequestService,
  ) { }


  setFile($event: File, langCode: string) {
    this.fileObj.set(langCode, $event);
  }

  uploadFiles() {
    if (this.fileObj.size) {

      this.fileObj.forEach((file, langCode) => {

        const postHref = '';

        const requestId = this.requestService.generateRequestId();


      });

    } else {
      this.notificationsService.warning(this.getTranslation('notification.no-files.title'), this.getTranslation('notification.no-files.content'));
    }
  }

  getLabel(value: string): string {
    return `${this.labelPrefix}.${value}`;
  }

  getTranslation(value: string): Observable<string> {
    return this.translate.get(`${this.labelPrefix}.${value}`);
  }
}
