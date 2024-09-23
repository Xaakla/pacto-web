import {Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {AppRoutes} from "../../core/config/routes.config";
import {RouteService} from "../../core/services/route.service";
import {AuthenticationService} from "../../core/services/rest/authentication.service";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  protected readonly localStorage = localStorage;

  constructor(
    private _routeService: RouteService,
    private _authenticationService: AuthenticationService
  ) {
  }

  public logout() {
    this._authenticationService.signout()
      .subscribe({
        next: () => {
          localStorage.clear();
          this.gotoSignin();
        }
      });
  }

  public gotoSignin(): void {
    this._routeService.go([AppRoutes.Public.Auth.Signin.path]);
  }
}
