import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WrittenService {
  private baseUrl = `${environment.apiUrl}/quotations`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Get written policies (quotations with status WRITTEN)
  getWrittenPolicies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
      params: { status: 'WRITTEN' }
    });
  }

  // Update policy
  updatePolicy(data: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Cancel policy
  cancelPolicy(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/`, {
      status: 'CANCELLED'
    }, {
      headers: this.getHeaders()
    });
  }
}
