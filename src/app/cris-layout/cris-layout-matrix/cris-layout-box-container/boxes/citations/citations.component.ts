import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ItemCitationService } from '../../../../../core/data/item-citation.service';
import { Citation } from '../../../../../core/shared/citation.model';
import { RemoteData } from '../../../../../core/data/remote-data';
import { PaginatedList } from '../../../../../core/data/paginated-list.model';
import { Item } from '../../../../../core/shared/item.model';
import { NotificationsService } from '../../../../../shared/notifications/notifications.service';
import { CrisLayoutBox } from 'src/app/core/layout/models/box.model';
import { RenderCrisLayoutBoxFor } from 'src/app/cris-layout/decorators/cris-layout-box.decorator';
import { LayoutBox } from 'src/app/cris-layout/enums/layout-box.enum';
import { CrisLayoutBoxModelComponent } from 'src/app/cris-layout/models/cris-layout-box-component.model';

@Component({
  selector: 'ds-citations',
  templateUrl: './citations.component.html',
  styleUrls: ['./citations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@RenderCrisLayoutBoxFor(LayoutBox.CITATIONS)
export class CitationsComponent extends CrisLayoutBoxModelComponent implements OnInit {
  citationTypes$: Observable<Citation[]>;
  selectedCitation$: Observable<RemoteData<Citation>>;
  private selectedCitationType$ = new BehaviorSubject<string>(null);

  constructor(
    protected translateService: TranslateService,
    @Inject('boxProvider') public boxProvider: CrisLayoutBox,
    @Inject('itemProvider') public itemProvider: Item,
    private citationService: ItemCitationService,
    private notificationsService: NotificationsService
  ) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit(): void {
    this.citationTypes$ = this.citationService.getAllExportTypes().pipe(
      map((citationTypesRD: RemoteData<PaginatedList<Citation>>) => citationTypesRD?.payload?.page ?? []),
    );

    // Lazy-load citation content only when a tab is selected
    this.selectedCitation$ = this.selectedCitationType$.pipe(
      switchMap((citationType: string) => {
        if (!citationType) {
          return new BehaviorSubject<RemoteData<Citation>>(null);
        }
        return this.citationService.getExportTypeById(citationType);
      }),
    );
  }

  onTabChange(citationType: string): void {
    this.selectedCitationType$.next(citationType);
  }

  copyCitation(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.notificationsService.success(
            this.translateService.get('citations.copy.success'),
          );
        })
        .catch(() => {
          this.notificationsService.error(
            this.translateService.get('citations.copy.error'),
          );
        });
    } else {
      this.notificationsService.error(
        this.translateService.get('citations.copy.error'),
      );
    }
  }
}
