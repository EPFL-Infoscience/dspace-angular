import { Component, Injector, TemplateRef } from '@angular/core';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService } from '../../../notifications/notifications.service';
import { BehaviorSubject } from 'rxjs';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SearchService } from '../../../../core/shared/search/search.service';
import { RequestService } from '../../../../core/data/request.service';
import { map } from 'rxjs/operators';
import { WorkflowItemDataService } from '../../../../core/submission/workflowitem-data.service';
import { RestRequestMethod } from '../../../../core/data/rest-request-method';
import { environment } from '../../../../../environments/environment';
import { DspaceRestService } from '../../../../core/dspace-rest/dspace-rest.service';
import { RawRestResponse } from '../../../../core/dspace-rest/raw-rest-response.model';

export const WORKFLOW_TASK_OPTION_EMAIL = 'submit_mail';

interface Email {
  templateName: string;
  subject: string;
  body: string;
}

@rendersWorkflowTaskOption(WORKFLOW_TASK_OPTION_EMAIL)
@Component({
  selector: 'ds-email',
  templateUrl: './claimed-task-actions-send-email.component.html',
  styleUrls: ['./claimed-task-actions-send-email.component.scss']
})
export class ClaimedTaskActionsSendEmailComponent extends ClaimedTaskActionsAbstractComponent {


  option = WORKFLOW_TASK_OPTION_EMAIL;

  email = <Email>{};

  templateList$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  endpoint = `${environment.rest.baseUrl}/api/email/template`;

  constructor(
    protected injector: Injector,
    protected router: Router,
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
    protected searchService: SearchService,
    protected requestService: RequestService,
    protected modalService: NgbModal,
    protected workflowItemService: WorkflowItemDataService,
    protected restService: DspaceRestService,
  ) {
    super(injector, router, notificationsService, translate, searchService, requestService);
  }

  openEmailModal(template: TemplateRef<any>) {

    this.restService.request(RestRequestMethod.GET, this.endpoint).subscribe((res: RawRestResponse) => {
      this.templateList$.next(res.payload as string[]);
    });

    const options: NgbModalOptions = {size: 'lg'};
    const modal = this.modalService.open(template, options);
    modal.result.then(console.log).then(() => {
      console.log('SEND EMAIL ' + JSON.stringify(this.email));
    }).catch((err) => undefined);
  }

  onTemplateChosen() {
    const templateEndpoint = `${this.endpoint}/${this.email.templateName}/claimedtask/${this.object.id}`;

    console.log(templateEndpoint);

    this.restService.request(RestRequestMethod.GET, templateEndpoint).pipe(
      map((res) => res?.payload),
    ).subscribe((res) => {
      this.email.body = res.content;
      console.log(res);
    });

  }

}
