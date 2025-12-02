import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Advisory {
  policyStatus: any;
  advisory_id?: number;
  id?: number;
  date_time_added?: Date;
  province?: string;
  district?: string;
  sector?: string;
  gender?: string;
  message: string;
  send_now: boolean;
  scheduled_date_time?: Date;
  status: string;
  recipients_count: number;
  sent_date_time?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdvisoryService {

  private baseUrl = `${environment.apiUrl}/advisories`;

  constructor(private http: HttpClient) {}

  getAdvisories(): Observable<Advisory[]> {
    return this.http.get<any>(`${this.baseUrl}/`).pipe(
      map((res) => Array.isArray(res) ? res : res.results ?? []),
      catchError(this.handleError)
    );
  }

  getAdvisory(id: number): Observable<Advisory> {
    return this.http.get<Advisory>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  createAdvisory(advisory: Partial<Advisory>): Observable<Advisory> {
    return this.http.post<Advisory>(`${this.baseUrl}/`, advisory)
      .pipe(catchError(this.handleError));
  }

  sendAdvisory(payload: any): Observable<Advisory> {
    return this.http.post<Advisory>(`${this.baseUrl}/send_advisory/`, payload)
      .pipe(catchError(this.handleError));
  }

  updateAdvisory(id: number, advisory: Partial<Advisory>): Observable<Advisory> {
    return this.http.put<Advisory>(`${this.baseUrl}/${id}/`, advisory)
      .pipe(catchError(this.handleError));
  }

  deleteAdvisory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  estimateRecipients(filters: any): Observable<number> {
    return this.http.post<{ count: number }>(`${this.baseUrl}/estimate_recipients/`, filters).pipe(
      map(res => res.count),
      catchError(this.handleError)
    );
  }

  getProvinces(): Observable<string[]> {
    return new Observable(observer => {
      observer.next(['Eastern', 'Northern', 'Southern', 'Western', 'Kigali City']);
      observer.complete();
    });
  }

  getDistricts(province: string): Observable<string[]> {
    const districts: any = {
      Eastern: ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
      Northern: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
      Southern: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
      Western: ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
      'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge']
    };

    return new Observable(observer => {
      observer.next(districts[province] || []);
      observer.complete();
    });
  }

  getSectors(): Observable<string[]> {
    return new Observable(observer => {
      observer.next(['Agriculture', 'Livestock', 'Fisheries', 'Forestry', 'Mixed Farming']);
      observer.complete();
    });
  }

  getPolicyStatuses(): Observable<string[]> {
    return new Observable(observer => {
      observer.next(['All', 'OPEN', 'PAID', 'WRITTEN', 'CANCELLED']);
      observer.complete();
    });
  }

  exportAdvisories(advisories: Advisory[]): void {
    const headers = ['ID', 'Date Added', 'Province', 'District', 'Sector', 'Gender', 'Message', 'Status', 'Recipients'];

    const rows = advisories.map(a => [
      a.id ?? a.advisory_id,
      new Date(a.date_time_added!).toLocaleString(),
      a.province ?? '',
      a.district ?? '',
      a.sector ?? '',
      a.gender ?? '',
      `"${a.message}"`,
      a.status,
      a.recipients_count
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `advisories_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  private handleError(error: any) {
    console.error('Advisory Service Error:', error);
    return throwError(() => error);
  }
}
