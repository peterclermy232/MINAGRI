import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { ApiClientTokenResponse } from '../types';
import * as moment from 'moment';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}
  private baseUrl = `${environment.authUrl}/`;

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
        map((resp: any) => {
          return resp.access_token;
        })
      );
  }

  appUserLogin(username: string, password: string) {
    return this.http
      .post(`${this.baseUrl}login/`, {
        username: username,
        password: password,
      })
      .pipe(
        tap(async (data: any) => {
          const storageData = {
            userToken: data.token,
            refreshToken: data.refresh,
            expiry: moment()
              .add('seconds', data.expires_in || 3600)
              .subtract('seconds', 60)
              .format('YYYY-MM-DD, h:mm:ss a'),
          };
          await this.setAppClientToken(storageData);

          // Store user data if present in response
          if (data.user) {
            await this.setUserData(data.user);
          }

          this.router.navigateByUrl('/dashboard');
        }),
        map((resp: any) => {
          console.log('app user response', resp);
          return resp.token;
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
    await localStorage.removeItem('userData');
  }

  async handleLogout() {
    await this.removeApiUserToken();
    this.router.navigateByUrl('/');
  }

  async removeStorage() {
    await localStorage.removeItem('apiToken');
    await localStorage.removeItem('userToken');
    await localStorage.removeItem('userData');
  }

  async setAppClientToken(data: { userToken: string; refreshToken?: string; expiry: string }) {
    const jsonData = JSON.stringify(data);
    await localStorage.setItem('userToken', jsonData);
  }

  // NEW METHOD: Store user data
  async setUserData(user: any) {
    const jsonData = JSON.stringify(user);
    await localStorage.setItem('userData', jsonData);
  }

  // NEW METHOD: Get current user data
  getCurrentUser(): any | null {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  // NEW METHOD: Get current user's organization ID
  getCurrentUserOrganizationId(): number {
    const user = this.getCurrentUser();
    if (user) {
      return user.organisation || user.organisation_id || 1;
    }
    return 1; // Default fallback
  }

  // NEW METHOD: Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isloggedInUserTokenUsable() && this.getCurrentUser() !== null;
  }

  // NEW METHOD: Get current token synchronously for interceptor
  getToken(): string | null {
    const tokenData = this.getStoredTokenData();
    if (tokenData) {
      const isExpired = moment().isAfter(tokenData.expiry);
      if (!isExpired) {
        return tokenData.userToken;
      }
    }
    return null;
  }

  // NEW METHOD: Get stored token data
  private getStoredTokenData(): { userToken: string; refreshToken?: string; expiry: string } | null {
    const jsonDt = localStorage.getItem('userToken');
    if (jsonDt) {
      try {
        return JSON.parse(jsonDt);
      } catch (error) {
        console.error('Error parsing stored token data:', error);
        return null;
      }
    }
    return null;
  }

  // NEW METHOD: Get refresh token
  private getRefreshToken(): string | null {
    const tokenData = this.getStoredTokenData();
    return tokenData?.refreshToken || null;
  }

  // NEW METHOD: Refresh token using Django endpoint
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post(`${this.baseUrl}token/refresh/`, {
        refresh: refreshToken,
      })
      .pipe(
        tap(async (data: any) => {
          const currentData = this.getStoredTokenData();
          if (currentData) {
            const storageData = {
              userToken: data.token,
              refreshToken: currentData.refreshToken,
              expiry: moment()
                .add('seconds', data.expires_in || 3600)
                .subtract('seconds', 60)
                .format('YYYY-MM-DD, h:mm:ss a'),
            };
            await this.setAppClientToken(storageData);
          }
        }),
        catchError((error) => {
          console.error('Token refresh failed:', error);
          this.removeStorage();
          return throwError(() => error);
        })
      );
  }

  // NEW METHOD: Logout observable for interceptor
  logout(): Observable<void> {
    return new Observable((observer) => {
      this.handleLogout().then(() => {
        observer.next();
        observer.complete();
      }).catch((error) => {
        observer.error(error);
      });
    });
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
    return this.getOauthToken().pipe(
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
  }

  // NEW METHOD: Check if OAuth token is usable
  isOauthTokenUsable(): boolean {
    const jsonDt = localStorage.getItem('apiToken');
    if (jsonDt) {
      try {
        const jsonParsed: { apiToken: string; expiry: string } = JSON.parse(jsonDt);
        return !moment().isAfter(jsonParsed.expiry);
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  // NEW METHOD: Check if logged in user token is usable
  isloggedInUserTokenUsable(): boolean {
    const jsonDt = localStorage.getItem('userToken');
    if (jsonDt) {
      try {
        const jsonParsed: { userToken: string; expiry: string } = JSON.parse(jsonDt);
        return !moment().isAfter(jsonParsed.expiry);
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  // NEW METHOD: Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.user_role || user?.userRole || null;
  }

  // NEW METHOD: Check if user has specific role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // NEW METHOD: Get user's full name
  getUserFullName(): string {
    const user = this.getCurrentUser();
    if (user) {
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      }
      return user.user_name || user.userName || 'User';
    }
    return 'Guest';
  }
}
