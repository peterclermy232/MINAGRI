import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {
  private baseUrl = `${environment.apiUrl}/insurance-products`;

  constructor(private http: HttpClient) { }

  getInsuranceProducts(status?: string): Observable<any> {
    let url = `${this.baseUrl}/`;
    if (status) {
      url += `?status=${status}`;
    }

    return this.http.get<any>(url)
      .pipe(
        map((res: any) => Array.isArray(res) ? res : res?.results || []),
        catchError(this.handleError)
      );
  }

  getInsuranceProduct(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  createInsuranceProduct(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/`, data)
      .pipe(catchError(this.handleError));
  }

  updateInsuranceProduct(data: any, id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/`, data)
      .pipe(catchError(this.handleError));
  }

  deleteInsuranceProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
