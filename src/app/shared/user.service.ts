import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;
  private authUrl = `${environment.apiUrl}/auth`;
  private orgsUrl = `${environment.apiUrl}/organisations`;
  private countriesUrl = `${environment.apiUrl}/countries`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    // Fetch all required data in parallel
    return forkJoin({
      usersResponse: this.http.get<any>(`${this.baseUrl}/`).pipe(
        map((res: any) => {
          // Handle both array response and object with results property
          if (Array.isArray(res)) return res;
          if (res?.results && Array.isArray(res.results)) return res.results;
          if (res?.result && Array.isArray(res.result)) return res.result;
          return [];
        }),
        catchError(this.handleError)
      ),
      orgsResponse: this.http.get<any>(`${this.orgsUrl}/`).pipe(
        map((res: any) => Array.isArray(res) ? res : res?.results || res?.result || []),
        catchError(() => []) // Return empty array on error
      ),
      countriesResponse: this.http.get<any>(`${this.countriesUrl}/`).pipe(
        map((res: any) => Array.isArray(res) ? res : res?.results || res?.result || []),
        catchError(() => []) // Return empty array on error
      )
    });
  }

  getUsersWithDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/with_details/`)
      .pipe(catchError(this.handleError));
  }

  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  createUser(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/`, data)
      .pipe(catchError(this.handleError));
  }

  updateUser(data: any, id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/`, data)
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  // Authentication methods
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login/`, {
      username: email,
      password: password
    }).pipe(catchError(this.handleError));
  }

  register(data: {
    user_email: string;
    password: string;
    first_name: string;
    last_name: string;
    user_phone_number?: string;
    organisation_id?: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register/`, data)
      .pipe(catchError(this.handleError));
  }

  logout(refreshToken: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/logout/`, {
      refresh: refreshToken
    }).pipe(catchError(this.handleError));
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/token/refresh/`, {
      refresh: refreshToken
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
