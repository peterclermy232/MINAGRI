import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { of, switchMap, tap } from 'rxjs';
import { ApiClientTokenResponse } from '../types';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  apiUserLogin() {
    return this.http
      .post(`/oauth2/token`, {
        request_type: 'apiUserLogin',
      })
      .pipe(
        tap(async (data: any) => {
          const storageData = {
            apiToken: data.access_token,
            expiry: moment()
              .add('seconds', data.expires_in)
              .subtract('seconds', 60)
              .format('YYYY-MM-DD, h:mm:ss a'),
          };
          console.log('api login store', storageData);
          await this.setApiClientToken(storageData);
        }),
        map((resp) => {
          return resp.access_token;
        })
      );
  }

  appUserLogin(data: any) {
    return this.http
      .post(`/oauth/token`, {
        consumer_key: environment.user_consumer_key,
        consumer_secret: environment.user_consumer_secret,
        request_type: 'userLogin',
      })
      .pipe(
        tap(async (data: any) => {
          const storageData = {
            userToken: data.token,
            expiry: moment()
              .add('seconds', data.lifetime)
              .subtract('seconds', 60)
              .format('YYYY-MM-DD, h:mm:ss a'),
          };
          await this.setAppClientToken(storageData);
          this.router.navigateByUrl('/organization');
        }),
        map((resp) => {
          console.log('app user response', resp);
          return resp.access_token;
        })
      );
  }

  async setApiClientToken(data: { apiToken: string; expiry: string }) {
    const jsonData = JSON.stringify(data);
    await localStorage.setItem('apiToken', jsonData);
  }

  async removeApiUserToken() {
    await localStorage.removeItem('apiToken');
    await localStorage.removeItem('userToken');
  }

  async handleLogout() {
    await this.removeApiUserToken();
    this.router.navigateByUrl('/');
  }

  async removeStorage() {
    await localStorage.removeItem('apiToken');
    await localStorage.removeItem('userToken');
  }

  async setAppClientToken(data: { userToken: string; expiry: string }) {
    const jsonData = JSON.stringify(data);
    await localStorage.setItem('userToken', jsonData);
  }

  getOauthToken() {
    const jsonDt = localStorage.getItem('apiToken');
    if (jsonDt) {
      const jsonParsed: { apiToken: string; expiry: string } =
        JSON.parse(jsonDt);
      console.log('current api user store', jsonDt);
      const isExpired = moment().isAfter(jsonParsed.expiry);
      if (isExpired) {
        return this.apiUserLogin();
      } else {
        return of(jsonParsed.apiToken);
      }
    } else {
      return this.apiUserLogin();
    }
  }

  getAuthToken() {
    const jsonDt = localStorage.getItem('userToken');
    if (jsonDt) {
      const jsonParsed: { userToken: string; expiry: string } =
        JSON.parse(jsonDt);
      console.log('jsonDt', jsonDt);
      const isExpired = moment().isAfter(jsonParsed.expiry);
      if (isExpired) {
        return this.apiUserLogin();
      } else {
        return of(jsonParsed.userToken);
      }
    } else {
      return this.apiUserLogin();
    }
  }

  getBothTokens() {
    this.getOauthToken().pipe(
      switchMap((tokenResponse) => {
        return this.getAuthToken();
      })
    );
  }

  combinedTest() {
    return this.getOauthToken().pipe(
      switchMap((wso2Token) => {
        return this.getAuthToken().pipe(
          map((userToken) => ({ wso2Token, userToken }))
        );
      }),
      tap(({ wso2Token, userToken }) => {
        console.log('bothresults', wso2Token, userToken);
        return of({ wso2Token, userToken });
      })
    );

    // combineAndPrintMsg(res1, res2) {
    //   console.log(`${res1.message}${res2?.message}`);
    // }
  }

  isOauthTokenUsable() {}
  isloggedInUserTokenUsable() {}
}
