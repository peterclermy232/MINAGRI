import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../shared/auth.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('outgoing', req);
    switch (this.requestType(req)) {
      case 'apiUserLogin':
        const oauthReq = req.clone({
          url: `${environment.oauth_baseurl}${req.url}?grant_type=client_credentials`,
          body: {},
          headers: new HttpHeaders()
            .set('Authorization', `Basic ${this.authBasicToken}`)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Access-Control-Allow-Origin', '*'),
        });
        return next.handle(oauthReq);
      case 'userLogin':
        return this.authService.getOauthToken().pipe(
          switchMap((token: any) => {
            console.log('ws02 token', token);
            const newBody = this.removeRequestTypeFromBody(req);
            const changedReq = req.clone({
              url: `${environment.auth_baseurl}${req.url}`,
              body: newBody.data,
              headers: new HttpHeaders()
                .set('Authorization', `Bearer ${token}`)
                .set('Access-Control-Allow-Origin', '*')
                .set('Content-Type', 'application/json'),
            });
            return next.handle(changedReq);
          })
        );
      case 'authApi':
        console.log('is auth');
        return this.authService.combinedTest().pipe(
          switchMap((tokenData: { wso2Token: string; userToken: string }) => {
            console.log('new tokens for auth', tokenData);
            const newReq: { typ: string; data: any } =
              this.removeRequestTypeFromBody(req);
            console.log(
              'removedParam',
              this.removeParam('request_type', req.url)
            );
            const newUrl = newReq.typ === 'params' ? newReq.data : req.url;
            const newBody = newReq.typ === 'body' ? newReq.data : req.body;
            const changedReq = req.clone({
              url: `${environment.auth_baseurl}${newUrl}`,
              body: newBody,
              headers: new HttpHeaders()
                .set('Authorization', `Bearer ${tokenData.wso2Token}`)
                .set('Auth', `Bearer ${tokenData.userToken}`)
                .set('Access-Control-Allow-Origin', '*'),
            });
            console.log('outgoing aauth api', changedReq);
            return next.handle(changedReq);
          })
        );
      case 'cropApi':
        console.log('is crop');
        return this.authService.combinedTest().pipe(
          switchMap((tokenData: { wso2Token: string; userToken: string }) => {
            console.log('new tokens for crop', tokenData);
            const newReq: { typ: string; data: any } =
              this.removeRequestTypeFromBody(req);
            console.log(
              'removedParam',
              this.removeParam('request_type', req.url)
            );
            const newUrl = newReq.typ === 'params' ? newReq.data : req.url;
            const newBody = newReq.typ === 'body' ? newReq.data : req.body;
            const changedReq = req.clone({
              url: `${environment.crop_baseurl}${newUrl}`,
              body: newBody,
              headers: new HttpHeaders()
                .set('Authorization', `Bearer ${tokenData.wso2Token}`)
                .set('Auth', `Bearer ${tokenData.userToken}`)
                .set('Access-Control-Allow-Origin', '*'),
            });
            console.log('outgoing crop api', changedReq);
            return next.handle(changedReq);
          })
        );
      default:
        console.log('this.requestType(req)', this.requestType(req));
        return next.handle(req);
    }
  }

  get authBasicToken() {
    return btoa(`${environment.consumer_key}:${environment.consumer_secret}`);
  }

  removeRequestTypeFromBody(req: any) {
    if (req.method === 'GET') {
      return {
        typ: 'params',
        data: this.removeParam('request_type', req.url),
      };
    } else {
      const { request_type, ...rest } = req.body;
      return { typ: 'body', data: rest };
    }
  }

  isOauthApi(str: string) {
    return str.includes('oauth2');
  }

  removeParam(key: string, sourceURL: any) {
    let rtn = sourceURL.split('?')[0],
      param,
      params_arr = [],
      queryString =
        sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';
    if (queryString !== '') {
      params_arr = queryString.split('&');
      for (let i = params_arr.length - 1; i >= 0; i -= 1) {
        param = params_arr[i].split('=')[0];
        if (param === key) {
          params_arr.splice(i, 1);
        }
      }
      if (params_arr.length) rtn = rtn + '?' + params_arr.join('&');
    }
    return rtn;
  }
  requestType(req: any) {
    if (req.method === 'GET') {
      const url_string = req.url;
      const url = new URL('http://domain.com' + url_string);
      return url.searchParams.get('request_type');
    } else {
      return req.body.request_type;
    }
  }

  isAuthenticationApi(str: string) {
    return str.includes('oauth2');
  }
}
