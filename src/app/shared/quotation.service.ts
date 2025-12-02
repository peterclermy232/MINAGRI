import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private baseUrl = `${environment.apiUrl}/quotations`;
  private farmerUrl = `${environment.apiUrl}/farmers`;
  private farmUrl = `${environment.apiUrl}/farms`;
  private productUrl = `${environment.apiUrl}/insurance_products`;

  constructor(private http: HttpClient) { }

  /**
   * Get all quotations with optional filters
   */
  getQuotations(status?: string, farmerId?: number): Observable<any> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (farmerId) {
      params = params.set('farmer_id', farmerId.toString());
    }

    return this.http.get<any>(`${this.baseUrl}/`, { params })
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new quotation
   */
  postQuotation(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/`, data)
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing quotation
   */
  updateQuotation(data: any, id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/`, data)
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a quotation
   */
  deleteQuotation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}/`)
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Get quotation by ID
   */
  getQuotationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/`)
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Get quotation statistics
   */
  getQuotationStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/`)
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Mark quotation as paid
   */
  markAsPaid(id: number, paymentReference: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/mark_paid/`, {
      payment_reference: paymentReference
    })
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Write policy from quotation
   */
  writePolicy(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/write_policy/`, {})
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Get farmers for dropdown
   */
  getFarmers(searchText?: string): Observable<any> {
    let params = new HttpParams();
    if (searchText) {
      params = params.set('search', searchText);
    }

    return this.http.get<any>(`${this.farmerUrl}/`, { params })
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Get farms by farmer ID
   */
  getFarmsByFarmer(farmerId: number): Observable<any> {
    let params = new HttpParams().set('farmer_id', farmerId.toString());

    return this.http.get<any>(`${this.farmUrl}/`, { params })
      .pipe(
        map((res: any) => res),
        catchError(this.handleError)
      );
  }

  /**
   * Get insurance products
   */
  getInsuranceProducts(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<any>(`${this.productUrl}/`, { params })
      .pipe(
        map((res: any) => res),
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
