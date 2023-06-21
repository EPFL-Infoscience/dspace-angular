import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { getFirstSucceededRemoteDataPayload } from '../../core/shared/operators';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Collection } from '../../core/shared/collection.model';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { ChangeSubmitterService } from '../../submission/change-submitter.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { WorkspaceItem } from '../../core/submission/models/workspaceitem.model';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService } from '../notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { isNotEmpty } from '../empty.util';
import { Item } from '../../core/shared/item.model';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'ds-change-submitter-button',
  templateUrl: './change-submitter-button.component.html',
  styleUrls: ['./change-submitter-button.component.scss']
})
export class ChangeSubmitterButtonComponent implements OnInit {

  // Either a WorkspaceItem or an Item must be provided

  @Input() workspaceItem: WorkspaceItem;

  @Input() item: Item;

  @Input() buttonClass: string;

  @Input() showIcon = true;

  @Input() showAlways = false;

  @Input() showToCollectionAdmin = false;

  @Input() showToSubmitter = false;

  @Input() submitterEmail: string;

  @Output() customEvent = new EventEmitter<any>();

  id: string;

  isWorkspaceItem: boolean;

  isItem: boolean;

  currentSubmitterEmail: string;

  constructor(
    protected changeSubmitterService: ChangeSubmitterService,
    protected authorizationService: AuthorizationDataService,
    protected collectionService: CollectionDataService,
    protected modalService: NgbModal,
    protected notificationsService: NotificationsService,
    protected authService: AuthService,
    protected translate: TranslateService,
  ) { }

  ngOnInit() {

    this.isWorkspaceItem = isNotEmpty(this.workspaceItem);
    this.isItem = isNotEmpty(this.item);

    if (this.isWorkspaceItem && this.isItem) {
      throw new Error('Either provide an item or a workspace item');
    }

    if (this.isWorkspaceItem) {
      this.id = this.workspaceItem.id;
      this.currentSubmitterEmail = this.submitterEmail;
    } else if (this.isItem) {
      this.id = this.item.id;
      this.currentSubmitterEmail = this.submitterEmail ?? this.item.submitterEmail;
    } else {
      throw new Error('No item provided');
    }
  }

  openChangeSubmitterModal(template: TemplateRef<any>) {
    const options: NgbModalOptions = { size: 'xl' };
    const modal = this.modalService.open(template, options);
    modal.result.then((submitter: DSpaceObject) => {

      const changeSubmitterResult = this.isWorkspaceItem ?
        this.changeSubmitterService.changeSubmitter(this.workspaceItem, submitter) :
        this.changeSubmitterService.changeSubmitterItem(this.item, submitter);

      changeSubmitterResult.subscribe((hasSucceeded) => {
        if (hasSucceeded) {
          const email = (submitter as EPerson).email;
          this.notificationsService.success(this.translate.instant('submission.workflow.generic.change-submitter.notification.success.title'),
            this.translate.instant('submission.workflow.generic.change-submitter.notification.success.content', { email }));
          this.customEvent.emit('refresh');
        } else {
          this.notificationsService.error(this.translate.instant('submission.workflow.generic.change-submitter.notification.error.title'),
            this.translate.instant('submission.workflow.generic.change-submitter.notification.error.content'));
        }
      });
    }, () => { void(0); });

  }

  isCollectionAdmin(): Observable<boolean> {
    // TODO check href
    const href = this.isWorkspaceItem ? this.workspaceItem._links.collection.href : this.item._links.owningCollection.href;
    const collectionHref$ = this.collectionService.findByHref(href).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((collection: Collection) => collection._links.self.href),
    );
    return collectionHref$.pipe(
      switchMap((collectionHref) => this.authorizationService.isAuthorized(FeatureID.AdministratorOf, collectionHref)),
      take(1),
    );
  }

  isItemSubmitter(): Observable<boolean> {
    const user$ = this.authService.getAuthenticatedUserFromStore();
    return user$.pipe(
      map(res => res.email === this.submitterEmail),
      take(1),
    );

  }

  get showSubmitterButton$(): Observable<boolean> {
    return combineLatest([this.isCollectionAdmin(), this.isItemSubmitter()]).pipe(
      map(([isCollectionAdmin, isItemSubmitter]) =>
        this.showAlways || this.showToCollectionAdmin && isCollectionAdmin || this.showToSubmitter && isItemSubmitter
      ),
      take(1),
    );
  }

}
