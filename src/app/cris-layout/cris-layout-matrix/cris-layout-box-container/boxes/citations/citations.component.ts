import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { ItemAvailableCitationsService } from '../../../../../core/data/citations/item-available-citations.service';
import { Citation } from '../../../../../core/shared/citation.model';
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

  constructor(
    protected translateService: TranslateService,
    @Inject('boxProvider') public boxProvider: CrisLayoutBox,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject(ItemAvailableCitationsService) private citationService: ItemAvailableCitationsService,
    private notificationsService: NotificationsService,
  ) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit(): void {
    this.citationTypes$ = this.citationService.getAllAvailableCitations(this.item.id);
  }

  copyCitation(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.notificationsService.success(
          this.translateService.get('citations.copy.success'),
        );
      }).catch(() => {
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
