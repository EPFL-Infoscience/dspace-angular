import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { VersionDataService } from '../../../core/data/version-data.service';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { switchMap } from 'rxjs';
import { VersionHistoryDataService } from '../../../core/data/version-history-data.service';

interface Badge {
  key: string;
  badgeClass: string;
}

@Component({
  selector: 'ds-epfl-badges',
  templateUrl: './epfl-badges.component.html',
  styleUrls: ['./epfl-badges.component.scss']
})
export class EpflBadgesComponent implements OnInit {

  @Input() item: Item;
  @Input() isWorkflowItem = false;

  badges: Badge[] = [];

  labelPrefix = 'mydspace.status.epfl.';

  constructor(
    private itemService: VersionDataService,
    private versionService: VersionDataService,
    private versionHistoryService: VersionHistoryDataService,
  ) {
  }

  ngOnInit(): void {

    if (this.item?.firstMetadataValue('epfl.workflow.additionalInformation') === 'true') {
      this.badges.push({ key: 'workflowAdditionalInformation', badgeClass: 'warning' });
    }

    if (this.item?.firstMetadataValue('epfl.workflow.rejected') === 'true') {
      this.badges.push({ key: 'workflowRejected', badgeClass: 'danger' });
    }

    // Show badge when the workflow item is a new version
    if (this.isWorkflowItem) {
      const versionHref = this.item._links.version.href;
      const version$ = this.versionService.findByHref(versionHref).pipe(
        getFirstSucceededRemoteDataPayload(),
      );
      version$.pipe(
        switchMap((version) => this.versionHistoryService.isLatest$(version)),
      ).subscribe((isLatest) => {
        if (isLatest) {
          this.badges.push({ key: 'newVersion', badgeClass: 'success' });
        }
      });
    }

  }

}
