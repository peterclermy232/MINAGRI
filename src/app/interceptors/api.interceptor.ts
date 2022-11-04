import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../shared/auth.service';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.isOauthApi(req.url)) {
      const oauthReq = req.clone({
        url: `${environment.oauth_baseurl}${req.url}`,
        headers: new HttpHeaders()
          .set('Authorization', `Basic ${this.authBasicToken}`)
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .set('Access-Control-Allow-Origin', 'https://minagri-web.vercel.app'),
      });
      return next.handle(oauthReq);
    }
    return this.authService.getOauthToken().pipe(
      switchMap((token: any) => {
        console.log('new token', token);
        const changedReq = req.clone({
          url: `${environment.crop_baseurl}${req.url}`,
          headers: new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set(
              'Access-Control-Allow-Origin',
              'https://minagri-web.vercel.app'
            ),
        });
        return next.handle(changedReq);
      })
    );
  }

  get authBasicToken() {
    return btoa(`${environment.consumer_key}:${environment.consumer_secret}`);
  }

  isOauthApi(str: string) {
    return str.includes('oauth2');
  }
}
