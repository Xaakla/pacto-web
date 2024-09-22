import {Injectable} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {take} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {INewPayment} from "../../interfaces/i-new-payment";

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly API = `${environment.API}/api/payment`;

  constructor(protected http: HttpClient) {
  }

  public createPayment(newPayment: INewPayment) {
    return this.http.post(this.API, newPayment, {observe: 'response'})
      .pipe(take(1));
  }

  public cancelPaymentById(id: number) {
    return this.http.put(`${this.API}/${id}`, {observe: 'response'})
      .pipe(take(1));
  }
}
