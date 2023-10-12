import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription} from 'rxjs';
import { SearchOptions } from '../../models/search-options.model';
import { ItemExportFormatService } from '../../../../core/itemexportformat/item-export-format.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../../notifications/notifications.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ds-item-export-url',
  templateUrl: './item-export-url.component.html',
  styleUrls: ['./item-export-url.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemExportUrlComponent implements OnDestroy {

  @Input() searchOptions$!: Observable<SearchOptions>;

  private sub?: Subscription;

  public href: string;

  constructor(
    private itemExportFormatService: ItemExportFormatService,
    private translate: TranslateService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}
  ngOnInit() {
    this.href = this.router.url;
  }

  public getAbsoluteLink() {
    return window.location.href;
  }

  public onClipboardCopy(successful: boolean): void {
    if (successful) {
      this.notificationsService.success(null, this.translate.get('mydspace.export-url.successful'));
    } else {
      this.notificationsService.error(null, this.translate.get('mydspace.export-url.failed'));
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
