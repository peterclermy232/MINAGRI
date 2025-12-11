import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaidService {
  private baseUrl = `${environment.apiUrl}/quotations`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Get paid quotations
  getPaidQuotations(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
      params: { status: 'PAID' }
    });
  }

  // Update paid quotation
  updatePaidQuotation(data: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/`, data, {
      headers: this.getHeaders()
    });
  }
}
