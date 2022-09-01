import {ChangeDetectionStrategy, Component, OnInit, TemplateRef} from '@angular/core';
import { fadeIn, fadeInOut } from '../../../shared/animations/fade';
import { Item } from '../../../core/shared/item.model';
import { ActivatedRoute } from '@angular/router';
import { ItemOperation } from '../item-operation/itemOperation.model';
import { distinctUntilChanged, first, map, mergeMap, switchMap, take, tap, toArray } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, from as observableFrom, Observable, of as observableOf } from 'rxjs';
import { RemoteData } from '../../../core/data/remote-data';
import { getItemEditRoute, getItemPageRoute } from '../../item-page-routing-paths';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { hasValue } from '../../../shared/empty.util';
import { getAllSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { ResearcherProfileService } from '../../../core/profile/researcher-profile.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { EPerson } from '../../../core/eperson/models/eperson.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeSubmitterService } from '../../../submission/change-submitter.service';
import { RequestService } from '../../../core/data/request.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ds-item-status',
  templateUrl: './item-status.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [
    fadeIn,
    fadeInOut
  ]
})
/**
 * Component for displaying an item's status
 */
export class ItemStatusComponent implements OnInit {

  /**
   * The item to display the status for
   */
  itemRD$: Observable<RemoteData<Item>>;

  itemSubmitterEmail$ = new BehaviorSubject<string>('');

  /**
   * The data to show in the status
   */
  statusData: any;
  /**
   * The keys of the data (to loop over)
   */
  statusDataKeys;

  /**
   * The possible actions that can be performed on the item
   *  key: id   value: url to action's component
   */
  operations$: BehaviorSubject<ItemOperation[]> = new BehaviorSubject<ItemOperation[]>([]);

  /**
   * The keys of the actions (to loop over)
   */
  actionsKeys;

  /**
   * Route to the item's page
   */
  itemPageRoute$: Observable<string>;

  private item$: BehaviorSubject<Item> = new BehaviorSubject<Item>(null);

  constructor(private route: ActivatedRoute,
              private authorizationService: AuthorizationDataService,
              private researcherProfileService: ResearcherProfileService,
              protected modalService: NgbModal,
              protected changeSubmitterService: ChangeSubmitterService,
              protected requestService: RequestService,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService) {
  }

  ngOnInit(): void {
    this.itemRD$ = this.route.parent.data.pipe(map((data) => data.dso));
    this.itemRD$.pipe(
      first(),
      map((data: RemoteData<Item>) => data.payload),
      tap((item: Item) => { this.itemSubmitterEmail$.next(item.submitterEmail); }),
    ).pipe(
      switchMap((item: Item) => {
        this.item$.next(item);
        this.statusData = Object.assign({
          id: item.id,
          handle: item.handle,
          lastModified: item.lastModified
        });
        this.statusDataKeys = Object.keys(this.statusData);
        /*
          The key is used to build messages
            i18n example: 'item.edit.tabs.status.buttons.<key>.label'
          The value is supposed to be a href for the button
        */
        const operations = [];
        operations.push(new ItemOperation('authorizations', this.getCurrentUrl(item) + '/authorizations', FeatureID.CanManagePolicies, true));
        operations.push(new ItemOperation('mappedCollections', this.getCurrentUrl(item) + '/mapper', FeatureID.CanManageMappings, true));
        if (item.isWithdrawn) {
          operations.push(new ItemOperation('reinstate', this.getCurrentUrl(item) + '/reinstate', FeatureID.ReinstateItem, true));
        } else {
          operations.push(new ItemOperation('withdraw', this.getCurrentUrl(item) + '/withdraw', FeatureID.WithdrawItem, true));
        }
        if (item.isDiscoverable) {
          operations.push(new ItemOperation('private', this.getCurrentUrl(item) + '/private', FeatureID.CanMakePrivate, true));
        } else {
          operations.push(new ItemOperation('public', this.getCurrentUrl(item) + '/public', FeatureID.CanMakePrivate, true));
        }
        operations.push(new ItemOperation('delete', this.getCurrentUrl(item) + '/delete', FeatureID.CanDelete, true));
        operations.push(new ItemOperation('move', this.getCurrentUrl(item) + '/move', FeatureID.CanMove, true));

        this.operations$.next(operations);

        const ops$ = observableFrom(operations).pipe(
          mergeMap((operation) => {
            if (hasValue(operation.featureID)) {
              return this.authorizationService.isAuthorized(operation.featureID, item.self).pipe(
                distinctUntilChanged(),
                map((authorized) => new ItemOperation(operation.operationKey, operation.operationUrl, operation.featureID, !authorized, authorized))
              );
            } else {
              return [operation];
            }
          }),
          toArray()
        );

        let orcidOps$ = observableOf([]);
        if (this.researcherProfileService.isLinkedToOrcid(item)) {
          orcidOps$ = this.researcherProfileService.adminCanDisconnectProfileFromOrcid().pipe(
              map((canDisconnect) => {
                if (canDisconnect) {
                  return [new ItemOperation('unlinkOrcid', this.getCurrentUrl(item) + '/unlink-orcid')];
                } else {
                  return [];
                }
              })
            );
        }

        return combineLatest([ops$, orcidOps$]);
      }),
      map(([ops, orcidOps]: [ItemOperation[], ItemOperation[]]) => [...ops, ...orcidOps])
    ).subscribe((ops) => this.operations$.next(ops));

    this.itemPageRoute$ = this.itemRD$.pipe(
      getAllSucceededRemoteDataPayload(),
      map((item) => getItemPageRoute(item))
    );
  }

  openChangeSubmitterModal(template: TemplateRef<any>) {
    const options: NgbModalOptions = {size: 'xl'};
    const modal = this.modalService.open(template, options);
    modal.closed
      .pipe(
        switchMap(submitter =>
          this.changeSubmitterService.changeSubmitterItem(this.item$.getValue(), submitter)
            .pipe(
              map(hasSucceeded => ({ hasSucceeded, submitter})),
              take(1)
            )
        )
      ).subscribe(({hasSucceeded, submitter}) => {
        if (hasSucceeded) {
          const email = (submitter as EPerson).email;
          this.itemSubmitterEmail$.next(email);
          this.notificationsService.success(this.translate.instant('submission.workflow.generic.change-submitter.notification.success.title'),
            this.translate.instant('submission.workflow.generic.change-submitter.notification.success.content', {email}));
        } else {
          this.notificationsService.error(this.translate.instant('submission.workflow.generic.change-submitter.notification.error.title'),
            this.translate.instant('submission.workflow.generic.change-submitter.notification.error.content'));
        }
      });
  }

  /**
   * Get the current url without query params
   * @returns {string}  url
   */
  getCurrentUrl(item: Item): string {
    return getItemEditRoute(item);
  }

  trackOperation(index: number, operation: ItemOperation) {
    return hasValue(operation) ? operation.operationKey : undefined;
  }

}
