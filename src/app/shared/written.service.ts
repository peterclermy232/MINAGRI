import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WrittenService {
  private baseUrl = `${environment.apiUrl}/quotations`;

  constructor(private http: HttpClient) { }

  getWrittenPolicies(): Observable<any> {
    let params = new HttpParams().set('status', 'WRITTEN');

    return this.http.get<any>(`${this.baseUrl}/`, { params })
      .pipe(
        map((res: any) => Array.isArray(res) ? res : res?.results || []),
        catchError(this.handleError)
      );
  }

  getPolicy(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  updatePolicy(data: any, id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/`, data)
      .pipe(catchError(this.handleError));
  }

  cancelPolicy(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/`, { status: 'CANCELLED' })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
