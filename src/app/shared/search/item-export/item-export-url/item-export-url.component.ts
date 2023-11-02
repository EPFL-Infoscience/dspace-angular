import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription} from 'rxjs';
import { SearchOptions } from '../../models/search-options.model';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../../notifications/notifications.service';

@Component({
  selector: 'ds-item-export-url',
  templateUrl: './item-export-url.component.html',
  styleUrls: ['./item-export-url.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemExportUrlComponent implements OnDestroy {

  @Input() searchOptions$!: Observable<SearchOptions>;

  private sub?: Subscription;

  constructor(
    private translate: TranslateService,
    private notificationsService: NotificationsService
  ) {}

  public getAbsoluteLink() {
    return window.location.href;
  }

  public copyUrlToClipboard() {
    navigator.clipboard.writeText(this.getAbsoluteLink())
      .then(() => this.notificationsService.success(null, this.translate.get('mydspace.export-url.successful')))
      .catch(() => this.notificationsService.error(null, this.translate.get('mydspace.export-url.failed')));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
