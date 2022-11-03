import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthHeaderInterceptor implements HttpInterceptor {
  constructor() {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const changedReq = req.clone({
      headers: new HttpHeaders().set(
        'Authorization',
        `Basic Uk9XRkthTEsyVDpBd3BHSVhBNFRydWNjbjZ0`
      ),
    });
    return next.handle(changedReq);
  }
}
