// interceptors/api.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  // List of endpoints that don't require authentication
  private publicEndpoints = [
    '/auth/login/',
    '/auth/register/',
    '/api/v1/organisations/',
    '/api/v1/countries/',
    '/oauth2/token'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if this is a public endpoint
    if (this.isPublicEndpoint(req.url)) {
      console.log('Public endpoint detected, skipping auth:', req.url);
      return next.handle(req);
    }

    // Add token to request if available
    const token = this.authService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Token added to request:', req.url);
    } else {
      console.log('No token available for request:', req.url);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('401 error detected, attempting token refresh');
          // Token expired or invalid, try to refresh
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if the URL matches any public endpoint
   */
  private isPublicEndpoint(url: string): boolean {
    return this.publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Handle 401 errors by attempting to refresh the token
   */
  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if user has a valid token before attempting refresh
    if (!this.authService.isloggedInUserTokenUsable()) {
      console.log('No valid token, redirecting to login');
      this.router.navigate(['/login']);
      return throwError(() => new Error('No valid authentication token'));
    }

    return this.authService.refreshToken().pipe(
      switchMap((response: any) => {
        console.log('Token refreshed successfully');
        // Retry the request with new token
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${response.token}`
          }
        });
        return next.handle(newReq);
      }),
      catchError((error) => {
        console.error('Token refresh failed, logging out');
        // Refresh failed, logout user
        this.authService.logout().subscribe();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }
}
