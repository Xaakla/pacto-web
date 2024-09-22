import {Component, OnInit} from '@angular/core';
import {FormReactiveBase} from "../../../shared/base-form/form-reactive-base";
import {FormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {AlertService} from "../../../core/services/alert.service";
import {ReactiveTypedFormsModule, RxwebValidators} from "@rxweb/reactive-form-validators";
import {NgClass} from "@angular/common";
import {FieldErrorMessageComponent} from "../../../shared/field-error-message/field-error-message.component";
import {AppButtonComponent} from "../../../shared/app-button/app-button.component";
import {CurrencyMaskModule} from "ng2-currency-mask";
import {FormDebugComponent} from "../../../shared/form-debug/form-debug.component";
import {SaleService} from "../../../core/services/rest/sale.service";
import {AppRoutes} from "../../../core/config/routes.config";
import {RouteService} from "../../../core/services/route.service";
import {INewEditSale} from "../../../core/interfaces/i-new-edit-sale";

@Component({
  selector: 'app-sale-new-edit',
  standalone: true,
  imports: [
    ReactiveTypedFormsModule,
    NgClass,
    FieldErrorMessageComponent,
    AppButtonComponent,
    CurrencyMaskModule,
    FormDebugComponent
  ],
  templateUrl: './sale-new-edit.component.html',
  styleUrl: './sale-new-edit.component.scss'
})
export class SaleNewEditComponent extends FormReactiveBase implements OnInit {

  public saleId!: number;
  public loading = false;

  constructor(
    private _fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _alertService: AlertService,
    private _saleService: SaleService,
    private _routeService: RouteService
  ) {
    super();
  }

  ngOnInit(): void {
    this._createForms();
    this._readParams();
  }

  private _createForms(): void {
    this.form = this._fb.group({
      id: [null],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      amount: ['', [Validators.required,
        RxwebValidators.maxNumber({value: 99999999.99}),
        RxwebValidators.minNumber({value: 1})]],
      currency: ['BRL', Validators.required]
    });
  }

  private _readParams() {
    this._activatedRoute.params
      .subscribe({
        next: ({productId}: any) => this.saleId = productId,
        error: (err) => this._alertService.errorToast(err.message)
      });
  }

  public get isEdit(): boolean {
    return !!this.saleId;
  }

  public gotoSalesList(): void {
    this._routeService.go([AppRoutes.Dashboard.Sales.path]);
  }

  private _formattedForm(): INewEditSale {
    return {
      ...this.form.value,
      amount: this.getValue('amount') * 100,
    }
  }

  submit(): void {
    this.loading = true;
    this._saleService.save(this._formattedForm())
      .subscribe({
        next: () => {
          this._alertService.successToast('Venda criada com sucesso!');
          this.gotoSalesList();
        }, error: () => {
          this.loading = false;
          this._alertService.errorToast('Erro ao salvar essa venda! Tente novamente mais tarde.');
        }
      });
  }
}
