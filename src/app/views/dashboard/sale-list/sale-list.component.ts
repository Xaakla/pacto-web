import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {RouteService} from "../../../core/services/route.service";
import {DebounceDirective} from "../../../shared/directive/debounce.directive";
import {CurrencyPipe, NgClass} from "@angular/common";
import {AppRoutes} from "../../../core/config/routes.config";
import {SaleService} from "../../../core/services/rest/sale.service";
import {ActivatedRoute} from "@angular/router";
import isObjectEmpty = Strings.isObjectEmpty;
import {FunctionCommon, Strings} from "../../../core/common/function.common";
import {AlertService} from "../../../core/services/alert.service";
import {ISale} from "../../../core/interfaces/i-sale";
import {AppPaginationComponent} from "../../../shared/app-pagination/app-pagination.component";
import {NgbAlert, NgbDropdown, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {SaleDetailsDialogComponent} from "../dialogs/sale-details-dialog/sale-details-dialog.component";
import {SalePaymentStatus} from "../../../core/model/sale-payment-status";

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    FormsModule,
    DebounceDirective,
    CurrencyPipe,
    AppPaginationComponent,
    NgbAlert,
    NgbDropdownToggle,
    NgbDropdown,
    NgbDropdownMenu,
    NgClass
  ],
  templateUrl: './sale-list.component.html',
  styleUrl: './sale-list.component.scss'
})
export class SaleListComponent implements OnInit {

  public pagination = this._defaultPagination;
  public ngbPage: number = 1;
  public sales: ISale[] = [];
  public loading: boolean = true;
  public selectedSalesIds: number[] = [];

  constructor(
    private _routeService: RouteService,
    private _saleService: SaleService,
    private _activatedRoute: ActivatedRoute,
    private _alertService: AlertService,
    private _modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
    this._readQueryParams();
  }

  private _readQueryParams() {
    this._activatedRoute.queryParams.subscribe({
      next: (params: any) => {
        if (!isObjectEmpty(params)) {
          this.pagination = {...this.pagination, ...params};
          this.ngbPage = Number(params?.page) + 1;
        }
        this._getPaginated(this.pagination);
      }
    });
  }

  private _getPaginated(params: any) {
    this._saleService.findAll(params)
      .subscribe({
        next: ({body}: any) => {
          this.sales = body['data']['result'].map((it: ISale) => {
            return {...it, checked: this.selectedSalesIds.includes(it.id)};
          });
          this.pagination = {
            ...this.pagination,
            page: body['data']['currentPage'],
            totalResults: body['data']['totalResults'],
            totalPages: body['data']['totalPages']
          };
          this.loading = false;
        }, error: () => {
          this.loading = false;
          this._alertService.errorToast('Erro ao buscar vendas!');
        }
      });
  }

  public search(): void {
    this.pagination.page = 0;
    this._routeService.updateQueryParams(this.pagination);
  }

  private get _defaultPagination(): any {
    return {
      q: '',
      transactionId: '',
      totalResults: 0,
      page: 0,
      itemsPerPage: 10,
      sortDirection: 'DESC'
    };
  }

  public gotoNewSale(): void {
    this._routeService.go([AppRoutes.Dashboard.Sales.New.path]);
  }

  public changeItemsPerPage(itemsPerPage: any): void {
    this._routeService.updateQueryParams({...this.pagination, page: 0, itemsPerPage});
  }

  public paginate(page: any): void {
    this.pagination.page = page - 1;
    this._routeService.updateQueryParams(this.pagination);
  }

  public openSaleDetailsDialog(saleId: number) {
    const modalRef = this._modalService
      .open(SaleDetailsDialogComponent, {size: 'lg', centered: true});

    modalRef.componentInstance.saleId = saleId;

    modalRef.result.finally(() => this._getPaginated(this.pagination));
  }

  public openConfirmDeleteSaleDialog(saleId: number): void {
    this._alertService.confirm(
      'Deletar Venda',
      `Tem certeza que deseja deletar a venda com id "${saleId}"? Essa ação é irreversível!`,
      (response: boolean) => {
        if (response) {
          this._deleteAllByIds([saleId],
            () => {
              this._alertService.successToast('Venda deletada com sucesso!');
              this._getPaginated(this.pagination);
              if (this.sales.length === 0 && this.ngbPage > 1) {
                this.pagination.page--;
              }
            }, ({error}: any) => {
              if (error === 'cannotDeletePaidSale') {
                this._alertService.warningToast("Não é possível deletar uma venda já paga!");
                return;
              }
              this._alertService.errorToast("Erro ao deletar venda!");
            }
          );
        }
      }
    );
  }

  public openConfirmDeleteUsersDialog() {
    this._alertService.confirm(
      'Deletar Vendas',
      `Tem certeza que deseja deletar esses usuários? Essa ação é irreversível!`,
      (response: boolean) => {
        if (response) {
          this._deleteAllByIds(this.selectedSalesIds,
            () => {
              this._alertService.successToast('Vendas deletadas com sucesso!');
              this._getPaginated(this.pagination);
              this.selectedSalesIds = [];
              if (this.sales.length === 0 && this.ngbPage > 1) {
                this.pagination.page--;
              }
            }, ({error}: any) => {
              this.selectedSalesIds = [];
              if (error === 'cannotDeletePaidSale') {
                this._alertService.warningToast("Não é possível deletar uma venda já paga!");
                return;
              }
              this._alertService.errorToast("Erro ao deletar vendas!");
            }
          );
        }
      }
    );
  }

  private _deleteAllByIds(ids: number[], next = () => {
  }, error = (error: any) => {
  }) {
    this._saleService.deleteAllByIds(ids)
      .subscribe({next: () => next(), error: () => error(error)});
  }

  public checkAll(event: any): void {
    this.sales.forEach((sale) => {
      sale.checked = event.target.checked;
      this.addOrRemoveSelected(!sale.checked, sale.id);
    });
  }

  public addOrRemoveSelected(condition: boolean, saleId: number) {
    // @ts-ignore
    FunctionCommon.addOrRemove(null, saleId, this.selectedSalesIds, condition);
  }

  public translateSalePaymentStatus(status: SalePaymentStatus): string {
    return FunctionCommon.translateSalePaymentStatus(status);
  }

  public allChecked(): boolean {
    return this.sales?.length > 0 && this.sales?.filter(it => !it.checked).length === 0;
  }

  protected readonly SalePaymentStatus = SalePaymentStatus;
}
