import {Injectable} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {FormGroup} from "@angular/forms";
import {take} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly API = `${environment.API}/api/auth`;

  constructor(protected http: HttpClient) {
  }

  public signup(data: any) {
    return this.http.post(`${this.API}/signup`, data, {observe: 'response'})
      .pipe(take(1));
  }

  public signin(data: any) {
    return this.http.post(`${this.API}/signin`, data, {observe: 'response'})
      .pipe(take(1));
  }

  public signout() {
    return this.http.get(`${this.API}/logout`, {observe: 'response'})
      .pipe(take(1));
  }
}
