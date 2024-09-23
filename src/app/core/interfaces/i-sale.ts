import {SalePaymentStatus} from "../model/sale-payment-status";

export interface ISale {
  id: number;
  description: string;
  currency: string;
  amount: number;
  status: SalePaymentStatus;
  checked?: boolean;
}
