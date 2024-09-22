import {Routes} from '@angular/router';
import {AppRoutes} from "./core/config/routes.config";

export const routes: Routes = [
  {path: AppRoutes.Empty.path, redirectTo: AppRoutes.Public.Auth.Signin.path, pathMatch: 'full'},
  {
    path: AppRoutes.Public.Auth.Signin.path,
    loadComponent: () => import('./views/authentication/signin/signin.component').then(m => m.SigninComponent),
    data: {title: 'Signin'}
  },
  {
    path: AppRoutes.Public.Auth.Signup.path,
    loadComponent: () => import('./views/authentication/signup/signup.component').then(m => m.SignupComponent),
    data: {title: 'Signup'}
  },
  {
    path: AppRoutes.Empty.path,
    children: [
      {
        path: AppRoutes.Dashboard.Sales.path,
        loadComponent: () => import('./views/dashboard/sale-list/sale-list.component').then(m => m.SaleListComponent)
      },
      {
        path: AppRoutes.Dashboard.Sales.New.path,
        loadComponent: () => import('./views/dashboard/sale-new-edit/sale-new-edit.component').then(m => m.SaleNewEditComponent)
      }
    ]
  },
];
