// interceptors/auth.interceptor.ts
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
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token for login and register endpoints
    if (req.url.includes('/auth/login/') || req.url.includes('/auth/register/')) {
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
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired, try to refresh
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap((response: any) => {
        // Retry the request with new token
        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${response.token}`
          }
        });
        return next.handle(newReq);
      }),
      catchError((error) => {
        // Refresh failed, logout user
        this.authService.logout().subscribe();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }
}
