import {Component, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {FormReactiveBase} from "../../../shared/base-form/form-reactive-base";
import {FieldErrorMessageComponent} from "../../../shared/field-error-message/field-error-message.component";
import {AppButtonComponent} from "../../../shared/app-button/app-button.component";
import {NgClass} from "@angular/common";
import {PasswordStrengthValidator} from "../../../core/validators/strength.validator";
import {RxwebValidators} from "@rxweb/reactive-form-validators";
import {AppRoutes} from "../../../core/config/routes.config";
import {RouteService} from "../../../core/services/route.service";
import {AuthenticationService} from "../../../core/services/rest/authentication.service";
import {AlertService} from "../../../core/services/alert.service";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FieldErrorMessageComponent,
    AppButtonComponent,
    NgClass
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent extends FormReactiveBase implements OnInit {

  public submittingFormLoading = false;

  constructor(
    private _fb: FormBuilder,
    private _routeService: RouteService,
    private _authenticationService: AuthenticationService,
    private _alertService: AlertService
  ) {
    super();
  }

  ngOnInit(): void {
    this._createForms();
  }

  private _createForms() {
    this.form = this._fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, RxwebValidators.minLength({value: 8}), PasswordStrengthValidator]],
      confirmPassword: ['', [Validators.required, RxwebValidators.compare({fieldName: 'password'})]],
    });
  }

  public gotoSignin(): void {
    this._routeService.go([AppRoutes.Public.Auth.Signin.path]);
  }

  submit(): void {
    this.submittingFormLoading = true;
    this._authenticationService.signup(this.form.value)
      .subscribe({
        next: ({body}: any) => {
          this._alertService.successToast(`Usuário "${body?.data?.name}" criado com sucesso!`);
          this.gotoSignin();
        }, error: () => {
          this._alertService.errorToast('Houve um erro ao tentar criar um novo usuário! Tente novamente mais tarde.');
          this.submittingFormLoading = false;
        }
      });
  }

}
