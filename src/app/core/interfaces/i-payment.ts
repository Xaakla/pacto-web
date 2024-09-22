export interface IPayment {
  id: number;
  amount: number;
  createdAt: Date;
  paymentProcessor: string;
  status: string;
  transactionId: string;
}
