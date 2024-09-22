import {HttpInterceptorFn} from '@angular/common/http';
import {Observable} from 'rxjs';
import {inject} from "@angular/core";
import {RouteService} from "../services/route.service";
import {AppRoutes} from "../config/routes.config";
import {HTTPStatus} from "../model/http-status.model";

export const httpInterceptFn: HttpInterceptorFn = (req, next) => {
  const _routeService = inject(RouteService); // Injeta o serviço de roteamento

  const clonedRequest = req.clone({
    withCredentials: true,
    setHeaders: {
      ...!(req.body instanceof FormData) && {'Content-Type': 'application/json;charset=utf-8'}
    }
  });

  return new Observable(observer => {
    next(clonedRequest).subscribe({
      next: value => observer.next(value),
      error: error => {
        switch (error.status) {
          case HTTPStatus.INTERNAL_SERVER_ERROR:
            _routeService.go([HTTPStatus.INTERNAL_SERVER_ERROR.toString()]);
            return;
          case HTTPStatus.NOT_FOUND:
            _routeService.go([HTTPStatus.NOT_FOUND.toString()]);
            return;
          case HTTPStatus.FORBIDDEN:
            _routeService.go([AppRoutes.Public.Auth.Signin.path]);
            return;
        }

        observer.error(error);
      }, complete: () => observer.complete()
    });
  });
};
