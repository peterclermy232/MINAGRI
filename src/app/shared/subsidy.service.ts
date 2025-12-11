import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubsidyService {
  private baseUrl = `${environment.apiUrl}/subsidies`;
  private orgsUrl = `${environment.apiUrl}/organisations`;
  private productsUrl = `${environment.apiUrl}/insurance_products`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Get all subsidies
  getSubsidies(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/`, {
      headers: this.getHeaders()
    }).pipe(map(res => res.results || res));
  }

  // Get subsidy by ID
  getSubsidyById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/`, {
      headers: this.getHeaders()
    });
  }

  // Get all organizations
  getOrganizations(): Observable<any[]> {
    return this.http.get<any>(`${this.orgsUrl}/`, {
      headers: this.getHeaders()
    }).pipe(map(res => res.results || res));
  }

  // Get all insurance products
  getInsuranceProducts(): Observable<any[]> {
    return this.http.get<any>(`${this.productsUrl}/`, {
      headers: this.getHeaders(),
      params: { status: 'ACTIVE' }
    }).pipe(map(res => res.results || res));
  }

  // Create new subsidy
  postSubsidy(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Update subsidy
  updateSubsidy(data: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Delete subsidy
  deleteSubsidy(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, {
      headers: this.getHeaders()
    });
  }

  // Get subsidies by organization
  getSubsidiesByOrganization(orgId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
      params: { organisation_id: orgId.toString() }
    }).pipe(map(res => res.results || res));
  }

  // Get subsidies by insurance product
  getSubsidiesByProduct(productId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
      params: { insurance_product_id: productId.toString() }
    }).pipe(map(res => res.results || res));
  }

  // Get subsidies with details
  getWithDetails(): Observable<any> {
    return this.http.get(`${this.baseUrl}/with_details/`, {
      headers: this.getHeaders()
    });
  }
}
