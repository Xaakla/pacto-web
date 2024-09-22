import {ApplicationConfig, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {httpInterceptFn} from "./core/interceptor/interceptor-http.service";
import {provideNgxMask} from "ngx-mask";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpInterceptFn])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideNgxMask()
  ]
};
