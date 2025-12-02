import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Organization {
  organisation_id?: number;
  organisation_name: string;
  organisation_email?: string;
  organisation_msisdn?: string;
  organisation_type?: number;
  country?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = `${environment.apiUrl}/organisations`; // use environment consistently

  constructor(private http: HttpClient) {}

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<{ results: Organization[] }>(`${this.baseUrl}/`)
      .pipe(map(res => res.results || []));
  }

  getOrganizationById(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.baseUrl}/${id}/`);
  }

  postOrganization(data: Organization): Observable<Organization> {
    return this.http.post<Organization>(`${this.baseUrl}/`, data);
  }

  updateOrganization(id: number, data: Organization): Observable<Organization> {
    return this.http.put<Organization>(`${this.baseUrl}/${id}/`, data);
  }

  deleteOrganization(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`);
  }
}
