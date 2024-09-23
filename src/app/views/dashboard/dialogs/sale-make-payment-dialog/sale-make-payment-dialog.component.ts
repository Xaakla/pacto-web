import {Component, Input, OnInit} from '@angular/core';
import {FormReactiveBase} from "../../../../shared/base-form/form-reactive-base";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {BtnCloseComponent} from "../../../../shared/btn-close/btn-close.component";
import {PaymentService} from "../../../../core/services/rest/payment.service";
import {CurrencyMaskModule} from "ng2-currency-mask";
import {FieldErrorMessageComponent} from "../../../../shared/field-error-message/field-error-message.component";
import {CurrencyPipe, NgClass} from "@angular/common";
import {AppButtonComponent} from "../../../../shared/app-button/app-button.component";
import {INewPayment} from "../../../../core/interfaces/i-new-payment";
import {AlertService} from "../../../../core/services/alert.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormDebugComponent} from "../../../../shared/form-debug/form-debug.component";
import {RxwebValidators} from "@rxweb/reactive-form-validators";
import {NgxMaskDirective} from "ngx-mask";

@Component({
  selector: 'app-sale-make-payment-dialog',
  standalone: true,
  templateUrl: './sale-make-payment-dialog.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BtnCloseComponent,
    CurrencyMaskModule,
    FieldErrorMessageComponent,
    NgClass,
    AppButtonComponent,
    FormDebugComponent,
    CurrencyPipe,
    NgxMaskDirective
  ],
  styleUrl: './sale-make-payment-dialog.component.scss'
})
export class SaleMakePaymentDialogComponent extends FormReactiveBase implements OnInit {

  @Input()
  public saleId!: number;

  @Input()
  public availableAmount!: number;

  public submittingFormLoading = false;

  constructor(
    private _fb: FormBuilder,
    private _paymentService: PaymentService,
    private _alertService: AlertService,
    private _ngbActiveModal: NgbActiveModal
  ) {
    super();
  }

  ngOnInit(): void {
    this._createForm();
    this._listenChanges();
  }

  private _createForm() {
    this.form = this._fb.group({
      cardNumber: ['', Validators.required],
      holder: ['', [Validators.required, Validators.maxLength(25)]],
      brand: ['VISA', Validators.required],
      expirationDate: ['', Validators.required],
      securityCode: ['', Validators.required],
      cardType: ['CREDIT'],
      saveCard: [false],
      saleId: [this.saleId],
      amount: ['', [Validators.required,
        RxwebValidators.minNumber({value: 0.01}),
        RxwebValidators.maxNumber({value: this.availableAmount / 100})]],
    });
  }

  private _listenChanges(): void {
    this.get('holder').valueChanges.subscribe((value: string) => {
      this.form.get('holder')?.patchValue(value.toUpperCase(), {emitEvent: false});
    });
  }

  private _onClose(): void {
    this._ngbActiveModal.close();
  }

  private _formattedPayment(): INewPayment {
    return {
      creditCard: {
        cardNumber: this.getValue('cardNumber'),
        holder: this.getValue('holder'),
        brand: this.getValue('brand'),
        expirationDate: this.getValue('expirationDate').substring(0, 2) + "/" + this.getValue('expirationDate').substring(2),
        securityCode: this.getValue('securityCode'),
        cardType: this.getValue('cardType'),
        saveCard: this.getValue('saveCard')
      },
      amount: this.getValue('amount') * 100,
      saleId: this.getValue('saleId')
    }
  }

  submit(): void {
    this.submittingFormLoading = true;
    this._paymentService.createPayment(this._formattedPayment())
      .subscribe({
        next: () => {
          this._onClose();
        }, error: ({error}) => {
          this.submittingFormLoading = false;
          if (error === 'Credit card validation failed') {
            this._alertService.errorToast('Cartão de crédito inválido! Verifique seus dados.');
            return;
          }
          this._alertService.errorToast('Houve um erro ao tentar efetuar o pagamento. Tente novamente!');
        }
      });
  }

}
