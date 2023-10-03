import { Component, OnInit } from '@angular/core';
import { AlertType } from '../shared/alert/aletr-type';
import { Observable, first, map, of, tap } from 'rxjs';
import { RegistrationData } from '../shared/external-log-in-complete/models/registration-data.model';
import { ActivatedRoute } from '@angular/router';
import { hasNoValue } from '../shared/empty.util';
import { mockRegistrationDataModel } from '../shared/external-log-in-complete/models/registration-data.mock.model';

@Component({
  templateUrl: './external-login-review-account-info-page.component.html',
  styleUrls: ['./external-login-review-account-info-page.component.scss']
})
export class ExternalLoginReviewAccountInfoPageComponent implements OnInit {
  /**
   * The token used to get the registration data
   */
  public token: string;

  /**
   * The type of alert to show
   */
  public AlertTypeEnum = AlertType;

  /**
   * The registration data of the user
   */
  public registrationData$: Observable<RegistrationData>;
  /**
   * Whether the component has errors
   */
  public hasErrors = false;

  constructor(
    private arouter: ActivatedRoute
  ) {
    this.token = this.arouter.snapshot.queryParams.token;
  }


  ngOnInit(): void {
    this.registrationData$ = this.arouter.data.pipe(first(),
      tap((data) => this.hasErrors = hasNoValue(data?.registrationData)),
      map((data) => data.registrationData));

    // TODO: remove this line (temporary)
    this.registrationData$ = of(
      mockRegistrationDataModel
    );
    this.hasErrors = false;
    this.token = '1234567890';
  }
}
