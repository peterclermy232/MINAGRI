import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private baseUrl = `${environment.apiUrl}/claims`;

  constructor(private http: HttpClient) { }

  getClaims(status?: string, farmerId?: number): Observable<any> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (farmerId) params = params.set('farmer_id', farmerId.toString());

    return this.http.get<any>(`${this.baseUrl}/`, { params })
      .pipe(
        map((res: any) => Array.isArray(res) ? res : res?.results || []),
        catchError(this.handleError)
      );
  }

  getClaim(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  createClaim(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/`, data)
      .pipe(catchError(this.handleError));
  }

  updateClaim(data: any, id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/`, data)
      .pipe(catchError(this.handleError));
  }

  deleteClaim(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  assignAssessor(claimId: number, assessorId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${claimId}/assign_assessor/`, {
      assessor_id: assessorId
    }).pipe(catchError(this.handleError));
  }

  approveClaim(claimId: number, approvedAmount: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${claimId}/approve/`, {
      approved_amount: approvedAmount
    }).pipe(catchError(this.handleError));
  }

  getClaimStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
