import {IPayment} from "./i-payment";

export interface IFullSale {
  id: number;
  description: string;
  currency: string;
  amount: number;
  payments: IPayment[];
}
