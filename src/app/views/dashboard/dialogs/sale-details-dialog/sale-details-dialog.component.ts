import {Component, Input, OnInit} from '@angular/core';
import {SaleService} from "../../../../core/services/rest/sale.service";
import {FormReactiveBase} from "../../../../shared/base-form/form-reactive-base";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AlertService} from "../../../../core/services/alert.service";
import {BtnCloseComponent} from "../../../../shared/btn-close/btn-close.component";
import {CurrencyMaskModule} from "ng2-currency-mask";
import {FieldErrorMessageComponent} from "../../../../shared/field-error-message/field-error-message.component";
import {CurrencyPipe, DatePipe, NgClass} from "@angular/common";
import {RxwebValidators} from "@rxweb/reactive-form-validators";
import {IPayment} from "../../../../core/interfaces/i-payment";
import {FormDebugComponent} from "../../../../shared/form-debug/form-debug.component";
import {NgbAlert, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {SaleMakePaymentDialogComponent} from "../sale-make-payment-dialog/sale-make-payment-dialog.component";
import {FunctionCommon} from "../../../../core/common/function.common";
import {PaymentStatus} from "../../../../core/model/payment-status";
import {AppButtonComponent} from "../../../../shared/app-button/app-button.component";
import {PaymentService} from "../../../../core/services/rest/payment.service";
import {LoadingComponent} from "../../../../shared/loading/loading.component";

@Component({
  selector: 'app-sale-details-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BtnCloseComponent,
    CurrencyMaskModule,
    FieldErrorMessageComponent,
    NgClass,
    FormDebugComponent,
    CurrencyPipe,
    DatePipe,
    AppButtonComponent,
    LoadingComponent,
    NgbAlert
  ],
  templateUrl: './sale-details-dialog.component.html',
  styleUrl: './sale-details-dialog.component.scss'
})
export class SaleDetailsDialogComponent extends FormReactiveBase implements OnInit {

  @Input()
  public saleId!: number;

  public loading = true;
  public submittingFormLoadingArray: boolean[] = [];

  constructor(
    private _fb: FormBuilder,
    private _saleService: SaleService,
    private _alertService: AlertService,
    private _modalService: NgbModal,
    private _paymentService: PaymentService
  ) {
    super();
  }

  ngOnInit(): void {
    this._createForms();
    this._findById();
  }

  private _createForms(): void {
    this.form = this._createEmptyForm();
  }

  private _createEmptyForm(): FormGroup {
    return this._fb.group({
      id: [null],
      description: [{value: '', disabled: true}, [Validators.required, Validators.maxLength(255)]],
      amount: [{value: '', disabled: true}, [Validators.required,
        RxwebValidators.maxNumber({value: 99999999.99}),
        RxwebValidators.minNumber({value: 1})]],
      currency: ['BRL', Validators.required],
      payments: this._fb.array([])
    });
  }

  private _createPaymentForm(payment: IPayment): FormGroup {
    return this._fb.group({
      id: [payment.id],
      amount: [payment.amount],
      createdAt: [payment.createdAt],
      paymentProcessor: [payment.paymentProcessor],
      status: [payment.status],
      transactionId: [payment.transactionId],
    });
  }

  private _findById() {
    this._saleService.findFullById(this.saleId)
      .subscribe({
        next: ({body}: any) => {
          this.form = this._createEmptyForm();
          body['data']['payments'].reverse().forEach((payment: IPayment) => {
            this.getFormArray('payments').push(this._createPaymentForm(payment));
            this.submittingFormLoadingArray.push(false);
          });
          this.form.patchValue({...body['data'], amount: body['data']['amount'] / 100});
          this.loading = false;
        }, error: () => this._alertService.errorToast('Erro ao buscar detalhes da venda!')
      });
  }

  public openMakePaymentDialog() {
    const modalRef = this._modalService
      .open(SaleMakePaymentDialogComponent, {size: 'md', centered: true});

    modalRef.componentInstance.saleId = this.saleId;
    modalRef.componentInstance.availableAmount = Math.floor(this.getValue('amount') * 100) - this._paidAmount();

    modalRef.result.then(() => {
      this.loading = true;
      this._findById();
    })
  }

  public translatePaymentStatus(status: PaymentStatus): string {
    return FunctionCommon.translatePaymentStatus(status);
  }

  public cancelPayment(id: number, index: number): void {
    this.submittingFormLoadingArray[index] = true;
    this._paymentService.cancelPaymentById(id)
      .subscribe({
        next: () => {
          this._alertService.successToast('Pagamento reembolsado com sucesso!');
          this.submittingFormLoadingArray[index] = false;
          this._findById();
        }, error: () => {
          this._alertService.errorToast('Erro ao reembolsar pagamento!');
          this.submittingFormLoadingArray[index] = false;
        }
      });
  }

  public isPaid(): boolean {
    if (this.getFormArray('payments').value
      .filter((payment: IPayment) => payment.status === PaymentStatus.SUCCESS).length === 0) {
      return false;
    }

    return Math.floor(this.getValue('amount') * 100) === this._paidAmount();
  }

  private _paidAmount(): number {
    return this.getFormArray('payments').value
      .filter((payment: IPayment) => payment.status === PaymentStatus.SUCCESS)
      .reduce((acc: number, payment: IPayment) => {
        return acc + payment.amount;
      }, 0);
  }

  public toggleFieldsStatus(enableFields: boolean) {
    this.get('description')[enableFields ? 'enable' : 'disable']();
  }

  submit(): void {
    this._saleService.save({...this.form.value, amount: this.getValue('amount') * 100})
      .subscribe({
        next: () => {
          this._alertService.successToast('Venda salva com sucesso!');
          this.toggleFieldsStatus(false);
        }
      })
  }

  protected readonly PaymentStatus = PaymentStatus;
}
