// claims.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Claim {
  claim_id: number;
  farmer_name: string;
  policy_number: string;
  claim_number: string;
  estimated_loss_amount: number;
  approved_amount?: number;
  status: string;
  claim_date: string;
  approval_date?: string;
  payment_date?: string;
  payment_reference?: string;
  farmer?: number;
  quotation?: number;
  loss_assessor?: number;
}

export interface Invoice {
  invoice_id: number;
  organisation_name: string;
  subsidy_name: string;
  invoice_number: string;
  amount: number;
  status: string;
  approved_date?: string;
  settlement_date?: string;
  payment_reference?: string;
  date_time_added: string;
  organisation?: number;
  subsidy?: number;
}

export interface LossAssessor {
  assessor_id: number;
  user_name: string;
  organisation_name: string;
  status: string;
  user?: number;
  organisation?: number;
}

export interface Subsidy {
  subsidy_id: number;
  subsidy_name: string;
  subsidy_rate: number;
  organisation_name: string;
  insurance_product_name?: string;
  status: string;
}

export interface ClaimStatistics {
  total_claims: number;
  by_status: Array<{status: string, count: number}>;
  total_claimed: number;
  total_approved: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ============== CLAIMS ENDPOINTS ==============

  getClaims(params?: any): Observable<Claim[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<Claim[]>(`${this.apiUrl}/claims/`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getClaim(id: number): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/claims/${id}/`, {
      headers: this.getHeaders()
    });
  }

  createClaim(claim: Partial<Claim>): Observable<Claim> {
    return this.http.post<Claim>(`${this.apiUrl}/claims/`, claim, {
      headers: this.getHeaders()
    });
  }

  updateClaim(id: number, claim: Partial<Claim>): Observable<Claim> {
    return this.http.patch<Claim>(`${this.apiUrl}/claims/${id}/`, claim, {
      headers: this.getHeaders()
    });
  }

  assignAssessor(claimId: number, assessorId: number): Observable<Claim> {
    return this.http.post<Claim>(
      `${this.apiUrl}/claims/${claimId}/assign_assessor/`,
      { assessor_id: assessorId },
      { headers: this.getHeaders() }
    );
  }

  approveClaim(claimId: number, approvedAmount: number): Observable<Claim> {
    return this.http.post<Claim>(
      `${this.apiUrl}/claims/${claimId}/approve/`,
      { approved_amount: approvedAmount },
      { headers: this.getHeaders() }
    );
  }

  getClaimStatistics(): Observable<ClaimStatistics> {
    return this.http.get<ClaimStatistics>(`${this.apiUrl}/claims/statistics/`, {
      headers: this.getHeaders()
    });
  }

  // ============== LOSS ASSESSORS ENDPOINTS ==============

  getLossAssessors(params?: any): Observable<LossAssessor[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<LossAssessor[]>(`${this.apiUrl}/loss-assessors/`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  // ============== INVOICES ENDPOINTS ==============

  getInvoices(params?: any): Observable<Invoice[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices/`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/invoices/${id}/`, {
      headers: this.getHeaders()
    });
  }

  createInvoice(invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/invoices/`, invoice, {
      headers: this.getHeaders()
    });
  }

  approveInvoice(invoiceId: number): Observable<Invoice> {
    return this.http.post<Invoice>(
      `${this.apiUrl}/invoices/${invoiceId}/approve/`,
      {},
      { headers: this.getHeaders() }
    );
  }

  settleInvoice(invoiceId: number, paymentReference: string): Observable<Invoice> {
    return this.http.post<Invoice>(
      `${this.apiUrl}/invoices/${invoiceId}/settle/`,
      { payment_reference: paymentReference },
      { headers: this.getHeaders() }
    );
  }

  // ============== SUBSIDIES ENDPOINTS ==============

  getSubsidies(params?: any): Observable<Subsidy[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<Subsidy[]>(`${this.apiUrl}/subsidies/`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  // ============== UTILITY METHODS ==============

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  exportToCSV(data: any[], filename: string, headers: string[]): void {
    const rows = data.map(item =>
      headers.map(header => {
        const value = this.getNestedValue(item, header);
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}
