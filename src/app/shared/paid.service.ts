import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaidService {
  private baseUrl = `${environment.apiUrl}/quotations`;

  constructor(private http: HttpClient) { }

  getPaidQuotations(): Observable<any> {
    let params = new HttpParams().set('status', 'PAID');

    return this.http.get<any>(`${this.baseUrl}/`, { params })
      .pipe(
        map((res: any) => Array.isArray(res) ? res : res?.results || []),
        catchError(this.handleError)
      );
  }

  writePolicy(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/write_policy/`, {})
      .pipe(catchError(this.handleError));
  }

  updatePaidQuotation(data: any, id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/`, data)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
