import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductInsurance } from '../manage-insurance/product-insurance.model';
import { environment } from 'src/environments/environment.prod';
import { OrganizationTypeResponse } from '../types';

@Injectable({
  providedIn: 'root'
})
export class ProductInsuranceService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all insurance products
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/insurance_products/`,
      { headers: this.getHeaders() });
  }

  // Get product by ID
  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/insurance_products/${id}/`,
      { headers: this.getHeaders() });
  }

  // Create new product
  createProduct(product: ProductInsurance): Observable<any> {
    return this.http.post(`${this.baseUrl}/insurance_products/`, product,
      { headers: this.getHeaders() });
  }

  // Update product
  updateProduct(id: number, product: ProductInsurance): Observable<any> {
    return this.http.put(`${this.baseUrl}/insurance_products/${id}/`, product,
      { headers: this.getHeaders() });
  }

  // Delete product
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/insurance_products/${id}/`,
      { headers: this.getHeaders() });
  }

  // Get organizations
  getOrganizations(): Observable<any> {
    return this.http.get<OrganizationTypeResponse>(`${this.baseUrl}/organisations/`,
      { headers: this.getHeaders() });
  }

  // Get product categories
  getProductCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/product_categories/`,
      { headers: this.getHeaders() });
  }

  // Get seasons
  getSeasons(): Observable<any> {
    return this.http.get(`${this.baseUrl}/seasons/`,
      { headers: this.getHeaders() });
  }

  // Get crops
  getCrops(): Observable<any> {
    return this.http.get(`${this.baseUrl}/crops/`,
      { headers: this.getHeaders() });
  }

  // Get crop varieties
  getCropVarieties(): Observable<any> {
    return this.http.get(`${this.baseUrl}/crop_varieties/`,
      { headers: this.getHeaders() });
  }

  // Export products to CSV/Excel
  exportProducts(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/insurance_products/export/`,
      { headers: this.getHeaders(), responseType: 'blob' });
  }
}
