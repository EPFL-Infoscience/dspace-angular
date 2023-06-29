import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription, switchMap } from 'rxjs';
import { SearchOptions } from '../../models/search-options.model';
import { ItemExportFormatService } from '../../../../core/itemexportformat/item-export-format.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../../notifications/notifications.service';
import { take } from 'rxjs/operators';

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
    private itemExportFormatService: ItemExportFormatService,
    private translate: TranslateService,
    private notificationsService: NotificationsService,
  ) {}

  exportUrl() {
    this.sub = this.searchOptions$.pipe(
      switchMap((searchOptions) => {
        return this.itemExportFormatService.doExportMulti(
          '',
          // @ts-ignore
          {id: 'epfl-publications'},
          searchOptions,
        );
      }),
    ).subscribe((processId) => {
      const title$ = this.translate.get('bulk-export-url.process.title');
      title$.pipe(take(1)).subscribe((title: string) => {
        this.notificationsService.process(processId.toString(), 5000, title);
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
