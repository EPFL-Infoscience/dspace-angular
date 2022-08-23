import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ScriptDataService } from '../../core/data/processes/script-data.service';

@Component({
  selector: 'ds-admin-language-labels',
  templateUrl: './admin-language-labels.component.html',
  styleUrls: ['./admin-language-labels.component.scss']
})
export class AdminLanguageLabelsComponent {

  fileObj = new Map<string, File>();

  availableLanguages = environment.languages;

  labelPrefix = 'admin.language-labels';

  constructor(
      protected notificationsService: NotificationsService,
      protected translate: TranslateService,
      private scriptDataService: ScriptDataService,
  ) { }


  setFile($event: File, langCode: string) {
    this.fileObj.set(langCode, $event);
  }

  uploadFiles() {
    if (this.fileObj.size) {

      this.fileObj.forEach((file, langCode) => {

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
