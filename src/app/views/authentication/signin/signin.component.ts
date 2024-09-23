import {Component, OnInit} from '@angular/core';
import {FormReactiveBase} from "../../../shared/base-form/form-reactive-base";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass} from "@angular/common";
import {AppButtonComponent} from "../../../shared/app-button/app-button.component";
import {FieldErrorMessageComponent} from "../../../shared/field-error-message/field-error-message.component";
import {AppRoutes} from "../../../core/config/routes.config";
import {RouteService} from "../../../core/services/route.service";
import {AuthenticationService} from "../../../core/services/rest/authentication.service";
import {AlertService} from "../../../core/services/alert.service";
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    AppButtonComponent,
    FieldErrorMessageComponent
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent extends FormReactiveBase implements OnInit {

  public submittingFormLoading = false;

  constructor(
    private _fb: FormBuilder,
    private _routeService: RouteService,
    private _authenticationService: AuthenticationService,
    private _alertService: AlertService
  ) {
    super();
  }

  ngOnInit() {
    this._createForms();
  }

  private _createForms() {
    this.form = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  public gotoSignup(): void {
    this._routeService.go([AppRoutes.Public.Auth.Signup.path]);
  }

  private _gotoDashboard(): void {
    this._routeService.go([AppRoutes.Dashboard.Sales.path]);
  }

  submit(): void {
    this.submittingFormLoading = true;
    this._authenticationService.signin(this.form.value)
      .subscribe({
        next: ({body}: HttpResponse<any>) => {
          localStorage.setItem('pacto_name', body?.data?.name);
          localStorage.setItem('pacto_email', body?.data?.email);
          this._gotoDashboard();
        },
        error: () => {
          this._alertService.errorToast('Erro ao logar seu usuário! Verifique suas credenciais.');
          this.submittingFormLoading = false;
        }
      });
  }

}
