import {Injectable} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {INewEditSale} from "../../interfaces/i-new-edit-sale";
import {take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  private readonly API = `${environment.API}/api/sales`;

  constructor(protected http: HttpClient) {
  }

  public save(sale: INewEditSale) {
    return this.http.post(this.API, sale, {observe: 'response'})
      .pipe(take(1));
  }

  public findAll(params: any) {
    return this.http.get(this.API, {params, observe: 'response'}).pipe(take(1));
  }

  public findById(id: any) {
    return this.http.get(`${this.API}/${id}`, {observe: 'response'}).pipe(take(1));
  }

  public findFullById(id: any) {
    return this.http.get(`${this.API}/${id}/full`, {observe: 'response'}).pipe(take(1));
  }

  public deleteAllByIds(ids: number[]) {
    return this.http.delete(`${this.API}`, {params: {ids}, observe: 'response'}).pipe(take(1));
  }

}
