import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WrittenService {
  private baseUrl = `${environment.apiUrl}/quotations`;
  private farmersUrl = `${environment.apiUrl}/farmers`;
  private farmsUrl = `${environment.apiUrl}/farms`;
  private productsUrl = `${environment.apiUrl}/insurance_products`;

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
    return this.http.get<any>(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
      params: { status: 'WRITTEN' }
    }).pipe(map(res => res.results || res));
  }

  // Get all farmers
  getFarmers(): Observable<any[]> {
    return this.http.get<any>(`${this.farmersUrl}/`, {
      headers: this.getHeaders()
    }).pipe(map(res => res.results));
  }

  // Get all farms
  getFarms(): Observable<any[]> {
    return this.http.get<any>(`${this.farmsUrl}/`, {
      headers: this.getHeaders()
    }).pipe(map(res => res.results));;
  }

  // Get farms by farmer ID
  getFarmsByFarmer(farmerId: number): Observable<any[]> {
    return this.http.get<any>(`${this.farmsUrl}/`, {
      headers: this.getHeaders(),
      params: { farmer_id: farmerId.toString() }
    }).pipe(map(res => res.results));
  }

  // Get all insurance products
  getInsuranceProducts(): Observable<any[]> {
    return this.http.get<any>(`${this.productsUrl}/`, {
      headers: this.getHeaders(),
      params: { status: 'ACTIVE' }
    }).pipe(map(res => res.results));
  }

  // Create new written policy (quotation)
  postPolicy(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Update policy
  updatePolicy(data: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Cancel policy (set status to CANCELLED)
  cancelPolicy(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/`, {
      status: 'CANCELLED'
    }, {
      headers: this.getHeaders()
    });
  }

  // Get quotations with related data
  getWithDetails(): Observable<any> {
    return this.http.get(`${this.baseUrl}/with_details/`, {
      headers: this.getHeaders()
    });
  }
}
