import { Component, EventEmitter, Injector, Input, Output, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { WorkspaceItem } from '../../../core/submission/models/workspaceitem.model';
import { MyDSpaceActionsComponent } from '../mydspace-actions';
import { WorkspaceitemDataService } from '../../../core/submission/workspaceitem-data.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { RequestService } from '../../../core/data/request.service';
import { SearchService } from '../../../core/shared/search/search.service';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { RemoteData } from '../../../core/data/remote-data';
import { NoContent } from '../../../core/shared/NoContent.model';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { ChangeSubmitterService } from '../../../submission/change-submitter.service';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { EPerson } from '../../../core/eperson/models/eperson.model';

/**
 * This component represents actions related to WorkspaceItem object.
 */
@Component({
  selector: 'ds-workspaceitem-actions',
  styleUrls: ['./workspaceitem-actions.component.scss'],
  templateUrl: './workspaceitem-actions.component.html',
})
export class WorkspaceitemActionsComponent extends MyDSpaceActionsComponent<WorkspaceItem, WorkspaceitemDataService> {

  /**
   * The workspaceitem object
   */
  @Input() object: WorkspaceItem;

  @Output() customEvent = new EventEmitter<any>();

  /**
   * A boolean representing if a delete operation is pending
   * @type {BehaviorSubject<boolean>}
   */
  public processingDelete$ = new BehaviorSubject<boolean>(false);

  /**
   * Initialize instance variables
   *
   * @param {Injector} injector
   * @param {Router} router
   * @param {NgbModal} modalService
   * @param {NotificationsService} notificationsService
   * @param {TranslateService} translate
   * @param {SearchService} searchService
   * @param {ChangeSubmitterService} changeSubmitterService
   * @param {RequestService} requestService
   */
  constructor(protected injector: Injector,
              protected router: Router,
              protected modalService: NgbModal,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService,
              protected searchService: SearchService,
              protected changeSubmitterService: ChangeSubmitterService,
              protected requestService: RequestService) {
    super(WorkspaceItem.type, injector, router, notificationsService, translate, searchService, requestService);
  }

  /**
   * Delete the target workspaceitem object
   */
  public confirmDiscard(content) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'ok') {
          this.processingDelete$.next(true);
          this.objectDataService.delete(this.object.id)
            .pipe(getFirstCompletedRemoteData())
            .subscribe((response: RemoteData<NoContent>) => {
              this.processingDelete$.next(false);
              this.handleActionResponse(response.hasSucceeded);
            });
        }
      }
    );
  }

  /**
   * Init the target object
   *
   * @param {WorkspaceItem} object
   */
  initObjects(object: WorkspaceItem) {
    this.object = object;
  }

  openChangeSubmitterModal(template: TemplateRef<any>) {
    const options: NgbModalOptions = { size: 'xl' };
    const modal = this.modalService.open(template, options);
    modal.result.then((submitter: DSpaceObject) => {

      this.changeSubmitterService.changeSubmitter(this.object, submitter).subscribe((hasSucceeded) => {
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
    }).catch((err) => undefined);

  }
}
