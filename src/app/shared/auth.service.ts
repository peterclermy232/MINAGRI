import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { of, tap } from 'rxjs';
import { ApiClientTokenResponse } from '../types';
import * as moment from 'moment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  apiUserLogin() {
    return this.http
      .post(`/oauth2/token?grant_type=client_credentials`, {})
      .pipe(
        tap(async (data: any) => {
          const storageData = {
            apiToken: data.access_token,
            expiry: moment()
              .add('seconds', data.expires_in)
              .subtract('seconds', 60)
              .format('YYYY-MM-DD, h:mm:ss a'),
          };
          await this.setApiClientToken(storageData);
        }),
        map((resp) => {
          return resp.access_token;
        })
      );
  }

  async setApiClientToken(data: { apiToken: string; expiry: string }) {
    const jsonData = JSON.stringify(data);
    await localStorage.setItem('apiToken', jsonData);
  }

  getOauthToken() {
    const jsonDt = localStorage.getItem('apiToken');
    if (jsonDt) {
      const jsonParsed: { apiToken: string; expiry: string } =
        JSON.parse(jsonDt);
      console.log('jsonDt', jsonDt);
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
}
