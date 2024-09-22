import {ICreditCard} from "./i-credit-card";

export interface INewPayment {
  creditCard: ICreditCard;
  saleId: number;
  amount: number;
}


