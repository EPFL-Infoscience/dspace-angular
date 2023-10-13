import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { Observable, of as observableOf } from 'rxjs';
import { map, switchMap} from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SubmissionRestService } from '../../../core/submission/submission-rest.service';
import { SubmissionService } from '../../submission.service';
import { SubmissionScopeType } from '../../../core/submission/submission-scope-type';
import { isNotEmpty } from '../../../shared/empty.util';
import { WorkflowAction } from '../../../core/tasks/models/workflow-action-object.model';
import { RemoteData } from '../../../core/data/remote-data';
import { ClaimedTask } from '../../../core/tasks/models/claimed-task-object.model';
import {
  getFirstCompletedRemoteData
} from '../../../core/shared/operators';
import { ClaimedTaskDataService } from '../../../core/tasks/claimed-task-data.service';
import { LinkService } from '../../../core/cache/builders/link.service';
import { followLink } from '../../../shared/utils/follow-link-config.model';
import { createFailedRemoteDataObject } from '../../../shared/remote-data.utils';
import { of } from 'rxjs/internal/observable/of';
import {RequestService} from '../../../core/data/request.service';
/**
 * This component represents submission form footer bar.
 */
@Component({
  selector: 'ds-submission-form-footer',
  styleUrls: ['./submission-form-footer.component.scss'],
  templateUrl: './submission-form-footer.component.html'
})
export class SubmissionFormFooterComponent implements OnInit, OnChanges {

  /**
   * The submission id
   * @type {string}
   */
  @Input() submissionId: string;

  /**
    * Submission type is workflow item submission
    * @type {boolean}
    */
  @Input() isWorkFlow = false;

  /**
    * Submission type is workflow item submission
    * @type {boolean}
    */
  @Input() item;

  /**
   * A boolean representing if a submission deposit operation is pending
   * @type {Observable<boolean>}
   */
  public processingDepositStatus: Observable<boolean>;

  /**
   * A boolean representing if a submission save operation is pending
   * @type {Observable<boolean>}
   */
  public processingSaveStatus: Observable<boolean>;

  /**
   * A boolean representing if showing deposit and discard buttons
   * @type {Observable<boolean>}
   */
  public showDepositAndDiscard: Observable<boolean>;

  /**
   * A boolean representing if submission form is valid or not
   * @type {Observable<boolean>}
   */
  public submissionIsInvalid: Observable<boolean> = observableOf(true);

  /**
   * A boolean representing if submission form has unsaved modifications
   */
  public hasUnsavedModification: Observable<boolean>;

  /**
   * ClaimedTask of the item if submission is workflow
   */
  public claimedTask: ClaimedTask;

  /**
   * The possible workflow actions of the ClaimedTask
   */
  public action: RemoteData<WorkflowAction>;

  /**
   * Initialize instance variables
   *
   * @param {NgbModal} modalService
   * @param {SubmissionRestService} restService
   * @param {SubmissionService} submissionService
   * @param {LinkService} linkService
   * @param {ClaimedTaskDataService} claimedTaskDataService
   */
  constructor(
    private modalService: NgbModal,
    private restService: SubmissionRestService,
    private requestService: RequestService,
    private submissionService: SubmissionService,
    protected linkService: LinkService,
    private claimedTaskDataService: ClaimedTaskDataService) {
  }

  /**
   * Get ClaimedTask from the item if its a workflow item
   */
  ngOnInit() {
    if (this.isWorkFlow) {
      this.claimedTaskDataService.findByItem(this.item.id, null,
        followLink('workflowitem', {useCachedVersionIfAvailable: false}, followLink('item'), followLink('submitter')),
        followLink('action', {useCachedVersionIfAvailable: false})
      ).pipe(
        getFirstCompletedRemoteData(),
        switchMap((claimedTaskRD: RemoteData<ClaimedTask>) => {
          if (claimedTaskRD.hasSucceededWithContent) {
            this.claimedTask = claimedTaskRD.payload;
            return this.claimedTask.action.pipe(
              getFirstCompletedRemoteData()
            );
          } else {
            return of(createFailedRemoteDataObject());
          }
        })
      ).subscribe((actionRD: RemoteData<WorkflowAction>) => {
        if (actionRD.hasSucceededWithContent) {
          this.action = actionRD;
        }
      });
    }
  }

  /**
   * Initialize all instance variables
   */
  ngOnChanges(changes: SimpleChanges) {

    if (isNotEmpty(this.submissionId)) {
      this.submissionIsInvalid = this.submissionService.getSubmissionStatus(this.submissionId).pipe(
        map((isValid: boolean) => isValid === false)
      );

      this.processingSaveStatus = this.submissionService.getSubmissionSaveProcessingStatus(this.submissionId);
      this.processingDepositStatus = this.submissionService.getSubmissionDepositProcessingStatus(this.submissionId);
      this.showDepositAndDiscard = observableOf(this.submissionService.getSubmissionScope() === SubmissionScopeType.WorkspaceItem);
      this.hasUnsavedModification = this.submissionService.hasUnsavedModification();
    }
  }

  /**
   * Dispatch a submission save action
   */
  save(event) {
    this.addStale();
    this.submissionService.dispatchSave(this.submissionId, true);
  }

  /**
   * Dispatch a submission save for later action
   */
  saveLater(event) {
    this.addStale();
    this.submissionService.dispatchSaveForLater(this.submissionId);
  }

  private addStale() {
    this.submissionService.getSubmissionSections(this.submissionId)
      .subscribe(value  => {
        if (value.find((element) => element.id === 'virtual-collection-bind') != null) {
          this.requestService.setStaleByHrefSubstring('RELATION.VirtualCollection.publication&scope='
            + this.submissionId.substring(0, this.submissionId.indexOf(':')));
        }
      });
  }

  /**
   * Dispatch a submission deposit action
   */
  public deposit(event) {
    this.submissionService.dispatchDeposit(this.submissionId);
  }

  /**
   * Dispatch a submission discard action
   */
  public confirmDiscard(content) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'ok') {
          this.submissionService.dispatchDiscard(this.submissionId);
        }
      }
    );
  }

  /**
   * Dispatch a submission deposit action
   */
  public approve(ev) {
    console.log(ev);
  }


  /**
   * Compute the proper label for the save for later button
   */
  public saveForLaterLabel(): string {
    if (this.submissionService.getSubmissionScope() === SubmissionScopeType.EditItem) {
      return 'submission.general.save-later.edit-item';
    }
    return 'submission.general.save-later';
  }

}
