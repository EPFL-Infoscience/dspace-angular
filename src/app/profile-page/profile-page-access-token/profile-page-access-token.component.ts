import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { EPerson } from '../../core/eperson/models/eperson.model';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { RemoteData } from '../../core/data/remote-data';
import { MachineToken } from '../../core/auth/models/machine-token.model';
import { NotificationsService } from '../../shared/notifications/notifications.service';

@Component({
  selector: 'ds-profile-page-access-token',
  templateUrl: './profile-page-access-token.component.html',
  styleUrls: ['./profile-page-access-token.component.scss']
})
export class ProfilePageAccessTokenComponent implements OnInit {

  /**
   * The authenticated user
   */
  @Input() user: EPerson;

  /**
   * A string containing the current token generated by the user
   */
  generatedToken: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  /**
   * A boolean representing if a machine token already exists for the current user
   */
  tokenAlreadyExists: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService,
    private clipboard: Clipboard,
    private modalService: NgbModal,
    private notificationService: NotificationsService,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    console.log(this.user);
    this.tokenAlreadyExists.next(this.user.machineTokenGenerated);
    console.log(this.tokenAlreadyExists.value);
  }

  /**
   * Copy the generated token to the clipboard
   */
  copyTokenToClipboard(): void {
    this.clipboard.copy(this.generatedToken.value);
  }

  /**
   * Method called to generate new access token
   */
  generateToken() {
    if (this.tokenAlreadyExists.value) {
      const modalRef = this.modalService.open(ConfirmationModalComponent);
      modalRef.componentInstance.headerLabel = 'profile.card.access-token.create-warning.title';
      modalRef.componentInstance.infoLabel = 'profile.card.access-token.create-warning.msg';
      modalRef.componentInstance.cancelLabel = 'profile.card.access-token.cancel';
      modalRef.componentInstance.confirmLabel = 'profile.card.access-token.confirm';
      modalRef.componentInstance.confirmIcon = 'fas fa-key';
      modalRef.componentInstance.brandColor = 'warning';
      modalRef.componentInstance.response.pipe(take(1)).subscribe((confirm: boolean) => {
        if (confirm) {
          this.processTokenGeneration();
        }
      });
    } else {
      this.processTokenGeneration();
    }
  }

  /**
   * Method called to revoke the current access token
   */
  revokeToken() {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.headerLabel = 'profile.card.access-token.delete-warning.title';
    modalRef.componentInstance.infoLabel = 'profile.card.access-token.delete-warning.msg';
    modalRef.componentInstance.cancelLabel = 'profile.card.access-token.cancel';
    modalRef.componentInstance.confirmLabel = 'profile.card.access-token.confirm';
    modalRef.componentInstance.confirmIcon = 'fas fa-trash-alt';
    modalRef.componentInstance.brandColor = 'danger';
    modalRef.componentInstance.response.pipe(take(1)).subscribe((confirm: boolean) => {
      if (confirm) {
        this.processTokenRevocation();
      }
    });
  }

  /**
   * Perform rest request to create new access token
   */
  private processTokenGeneration() {
    this.authService.createMachineToken().pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((response: RemoteData<MachineToken>) => {
      if (response.hasSucceeded) {
        this.generatedToken.next(response.payload.value);
        this.tokenAlreadyExists.next(true);
        console.log(response, response.hasSucceeded);
      } else {
        this.notificationService.error(null, this.translate.instant('profile.card.access-token.create.error'));
      }
    });
  }

  /**
   * Perform rest request to revoke the current access token
   */
  private processTokenRevocation() {
    this.authService.deleteMachineToken().pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((response: RemoteData<MachineToken>) => {
      if (response.hasSucceeded) {
        this.generatedToken.next(null);
        this.tokenAlreadyExists.next(false);
      } else {
        this.notificationService.error(null, this.translate.instant('profile.card.access-token.create.error'));
      }
    });
  }
}
