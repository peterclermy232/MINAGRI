import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FarmerService {
  private baseUrl = `${environment.apiUrl}/farmers`;

  constructor(private http: HttpClient) { }

  /**
   * Get all farmers with optional search parameter
   */
  getFarmer(searchText?: string): Observable<any> {
    let params = new HttpParams();
    if (searchText && searchText.trim() !== '') {
      params = params.set('search', searchText.trim());
    }

    return this.http.get<any>(`${this.baseUrl}/`, { params })
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new farmer
   */
  postFarmer(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/`, data)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing farmer
   */
  updateFarmer(data: any, id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/`, data)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a farmer
   */
  deleteFarmer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}/`)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get a single farmer by ID
   */
  getFarmerById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/`)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get farmer statistics
   */
  getFarmerStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/`)
      .pipe(
        map((res: any) => {
          return res;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Error handling
   */
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
