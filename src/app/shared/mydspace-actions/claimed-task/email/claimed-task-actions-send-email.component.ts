import { Component, Injector, TemplateRef } from '@angular/core';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService } from '../../../notifications/notifications.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SearchService } from '../../../../core/shared/search/search.service';
import { RequestService } from '../../../../core/data/request.service';
import {
  ClaimedTaskActionsReturnToPoolComponent
} from '../return-to-pool/claimed-task-actions-return-to-pool.component';
import { getFirstSucceededRemoteDataPayload } from '../../../../core/shared/operators';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { WorkflowItem } from '../../../../core/submission/models/workflowitem.model';
import { WorkflowItemDataService } from '../../../../core/submission/workflowitem-data.service';

export const WORKFLOW_TASK_OPTION_EMAIL = 'email';

@rendersWorkflowTaskOption(WORKFLOW_TASK_OPTION_EMAIL)
@Component({
  selector: 'ds-email',
  templateUrl: './claimed-task-actions-send-email.component.html',
  styleUrls: ['./claimed-task-actions-send-email.component.scss']
})
export class ClaimedTaskActionsSendEmailComponent extends ClaimedTaskActionsAbstractComponent {


  option = WORKFLOW_TASK_OPTION_EMAIL;


  templateList$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(
    protected injector: Injector,
    protected router: Router,
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
    protected searchService: SearchService,
    protected requestService: RequestService,
    protected modalService: NgbModal,
    protected workflowItemService: WorkflowItemDataService,
  ) {
    super(injector, router, notificationsService, translate, searchService, requestService);
  }

  ngOnInit(): void {
  }


  openEmailModal(template: TemplateRef<any>) {

    // TODO initialize template list
    this.templateList$.next(['TEMPLATE_1', 'TEMPLATE_2']);

    const submitterHref$: Observable<string> = this.object.workflowitem.pipe(
      getFirstSucceededRemoteDataPayload(),
      map((workflowItem: WorkflowItem) => workflowItem._links.submitter.href),
      tap(console.log)
    );

    /*const submitter$ = submitterHref$.pipe(
      mergeMap((res) => this.workflowItemService.findByHref(res)),
      tap(console.log)
    ).subscribe();*/

    // TODO retrieve submitter: ok with admin, error with other users

    const options: NgbModalOptions = {size: 'lg'};
    const modal = this.modalService.open(template, options);
    modal.result.then(console.log).catch((err) => undefined);
  }

}
