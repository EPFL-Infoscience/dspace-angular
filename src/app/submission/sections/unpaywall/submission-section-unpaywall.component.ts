import { Component, Inject, OnDestroy } from '@angular/core';
import { renderSectionFor } from '../sections-decorator';
import { SectionsType } from '../sections-type';
import { WorkspaceitemDataService } from '../../../core/submission/workspaceitem-data.service';
import { ActivatedRoute } from '@angular/router';
import { SectionModelComponent } from '../models/section.model';
import { SectionDataObject } from '../models/section-data.model';
import { SectionsService } from '../sections.service';
import { BehaviorSubject, interval, Observable, Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { SubmissionState } from '../../submission.reducers';
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { submissionObjectFromIdSelector } from '../../selectors';
import { SubmissionObjectEntry } from '../../objects/submission-objects.reducer';
import { followLink } from '../../../shared/utils/follow-link-config.model';
import { DisableSectionAction, EnableSectionAction } from '../../objects/submission-objects.actions';
import {
  WorkspaceitemSectionUnpaywallObject
} from '../../../core/submission/models/workspaceitem-section-unpaywall-object';
import { UnpaywallSectionStatus } from './models/unpaywall-section-status';
import { FileUploader } from 'ng2-file-upload';
import { HALEndpointService } from '../../../core/shared/hal-endpoint.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SubmissionService } from '../../submission.service';
import { HttpXsrfTokenExtractor } from '@angular/common/http';
import { XSRF_REQUEST_HEADER } from '../../../core/xsrf/xsrf.interceptor';
import { WorkspaceItem } from '../../../core/submission/models/workspaceitem.model';
import { normalizeSectionData } from '../../../core/submission/submission-response-parsing.service';
import { hasValue, isEmpty, isNotEmpty } from '../../../shared/empty.util';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import parseSectionErrors from '../../utils/parseSectionErrors';
import { TranslateService } from '@ngx-translate/core';

const DOI_METADATA = 'dc.identifier.doi';
const API_CHECK_INTERVAL = 3000;
const FILE_NAME = 'unpaywall.json';
const FILE_TYPE = 'application/json';

@Component({
  selector: 'ds-submission-section-unpaywall-component',
  templateUrl: './submission-section-unpaywall.component.html',
  styleUrls: ['./submission-section-unpaywall.component.scss']
})
@renderSectionFor(SectionsType.Unpaywall)
export class SubmissionSectionUnpaywallComponent extends SectionModelComponent implements OnDestroy {

  public readonly UnpaywallSectionStatus = UnpaywallSectionStatus;
  public status$ = new BehaviorSubject<string>(null);
  public loading$ = new BehaviorSubject<boolean>(true);
  private checkIntervalSubscription: Subscription;
  private section: WorkspaceitemSectionUnpaywallObject;
  private unsubscribe$ = new Subject<void>();

  constructor(
    protected sectionService: SectionsService,
    protected store: Store<SubmissionState>,
    private workspaceItemService: WorkspaceitemDataService,
    private route: ActivatedRoute,
    private halService: HALEndpointService,
    private authService: AuthService,
    private submissionService: SubmissionService,
    private tokenExtractor: HttpXsrfTokenExtractor,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    @Inject('collectionIdProvider') public injectedCollectionId: string,
    @Inject('sectionDataProvider') public injectedSectionData: SectionDataObject,
    @Inject('submissionIdProvider') public injectedSubmissionId: string
  ) {
    super(
      injectedCollectionId,
      injectedSectionData,
      injectedSubmissionId,
    );
  }

  public ngOnInit(): void {
    this.store.select(submissionObjectFromIdSelector(this.submissionId))
      .pipe(
        takeUntil(this.unsubscribe$),
        map(value => this.getDoiMetadataValue(value)),
        distinctUntilChanged(),
      )
      .subscribe(doiValue => !!doiValue ? this.showCurrentSection() : this.hideCurrentSection());
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    super.ngOnDestroy();
  }

  public manualApiCheck(): void {
    this.loading$.next(true);
    this.checkApi().pipe(takeUntil(this.unsubscribe$)).subscribe(unpaywallSection => {
        this.section = unpaywallSection;
        this.status$.next(unpaywallSection?.status);
        this.loading$.next(false);
      }
    );
  }

  private startApiCheck(): void {
    this.loading$.next(true);
    if (this.checkIntervalSubscription && !this.checkIntervalSubscription.closed) {
      this.checkIntervalSubscription.unsubscribe();
    }
    this.checkIntervalSubscription = interval(API_CHECK_INTERVAL)
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() => this.checkApi())
      )
      .subscribe(unpaywallSection => {
          if (!!unpaywallSection?.status && unpaywallSection?.status !== UnpaywallSectionStatus.PENDING) {
            this.status$.next(unpaywallSection?.status);
            this.section = unpaywallSection;
            this.stopApiCheck();
          }
        }
      );
  }

  private stopApiCheck(): void {
    this.loading$.next(false);
    if (this.checkIntervalSubscription) {
      this.checkIntervalSubscription.unsubscribe();
    }
  }

  private checkApi(): Observable<WorkspaceitemSectionUnpaywallObject> {
    const id = this.route.snapshot.paramMap.get('id');
    return this.workspaceItemService
      .findById(id, false, false, followLink('item'))
      .pipe(
        map(value =>
          (value.payload?.sections?.unpaywall as WorkspaceitemSectionUnpaywallObject))
      );
  }

  private getDoiMetadataValue(value: SubmissionObjectEntry): string {
    return value.sections[value.definition]?.data[DOI_METADATA];
  }

  private hideCurrentSection(): void {
    this.stopApiCheck();
    this.store.dispatch(new DisableSectionAction(this.submissionId, this.injectedSectionData.id));
  }

  private showCurrentSection(): void {
    this.startApiCheck();
    this.store.dispatch(new EnableSectionAction(this.submissionId, this.injectedSectionData.id));
  }

  public uploadFileIfNeeded(): void {
    if (this.section.status === UnpaywallSectionStatus.SUCCESSFUL) {
      const file = new File([this.section.jsonRecord], FILE_NAME, {type: FILE_TYPE});
      this.halService.getEndpoint(this.submissionService.getSubmissionObjectLinkName())
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(endpointUrl => {
          const uploader = new FileUploader({
            url: endpointUrl.concat(`/${this.submissionId}`),
            authToken: this.authService.buildAuthHeader(),
            autoUpload: false,
            headers: [{name: XSRF_REQUEST_HEADER, value: this.tokenExtractor.getToken()}]
          });
          this.uploadFile(uploader, file);
        });
    }
  }

  private uploadFile(uploader: FileUploader, file: File): void {
    const onSuccessItem$ = new BehaviorSubject<WorkspaceItem>(null);
    onSuccessItem$
      .pipe(
        filter(hasValue),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(workspaceItem => this.updateUploadSection(workspaceItem));
    uploader.onSuccessItem = (item, response) => onSuccessItem$.next(JSON.parse(response) as WorkspaceItem);
    uploader.addToQueue([file]);
    uploader.uploadAll();
  }

  private updateUploadSection(workspaceItem: WorkspaceItem): void {
    const sections = workspaceItem.sections;
    const errors = workspaceItem.errors;
    const errorsList = parseSectionErrors(errors);
    if (sections && isNotEmpty(sections)) {
      Object.keys(sections).forEach((sectionId) => {
        const sectionData = normalizeSectionData(sections[sectionId]);
        const sectionErrors = errorsList[sectionId];
        this.sectionService.isSectionType(this.submissionId, sectionId, SectionsType.Upload)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((isUpload) => {
            if (isUpload) {
              if ((isEmpty(sectionErrors))) {
                this.notificationsService
                  .success(null, this.translate.get('submission.sections.upload.upload-successful'));
              } else {
                this.notificationsService.error(null, this.translate.get('submission.sections.upload.upload-failed'));
              }
            }
          });
        this.sectionService.updateSectionData(this.submissionId, sectionId, sectionData, sectionErrors, sectionErrors);
      });
    }
  }

  protected getSectionStatus(): Observable<boolean> {
    return undefined;
  }

  protected onSectionDestroy(): void {
  }

  protected onSectionInit(): void {
  }
}
