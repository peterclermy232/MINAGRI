
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LossAssessorService {
  private baseUrl = `${environment.apiUrl}/loss_assessors`;

  constructor(private http: HttpClient) { }

  getLossAssessors(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http.get<any>(`${this.baseUrl}/`, { params })
      .pipe(
        map((res: any) => Array.isArray(res) ? res : res?.results || []),
        catchError(this.handleError)
      );
  }

  getLossAssessor(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  getAllLossAssessors(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/`)
    .pipe(
      map((res: any) => Array.isArray(res) ? res : res?.results || []),
      catchError(this.handleError)
    );
}


  createLossAssessor(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/`, data)
      .pipe(catchError(this.handleError));
  }

  updateLossAssessor(data: any, id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/`, data)
      .pipe(catchError(this.handleError));
  }

  deleteLossAssessor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
