import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private baseUrl = `${environment.apiUrl}/invoices`;
  private subsidyUrl = `${environment.apiUrl}/subsidies`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ============== GET INVOICES ==============

  // Get all invoices
  getInvoices(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/`, {
      headers: this.getHeaders()
    }).pipe(map(res => res.results || res));
  }

  // Get invoices by status
  getInvoicesByStatus(status: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
      params: { status: status.toUpperCase() }
    }).pipe(map(res => res.results || res));
  }

  // Get pending invoices (waiting for approval)
  getPendingInvoices(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/pending/`, {
      headers: this.getHeaders()
    }).pipe(map(res => res.results || res));
  }

  // Get approved invoices (ready for settlement)
  getApprovedInvoices(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/approved/`, {
      headers: this.getHeaders()
    }).pipe(map(res => res.results || res));
  }

  // Get settled invoices
  getSettledInvoices(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/settled/`, {
      headers: this.getHeaders()
    }).pipe(map(res => res.results || res));
  }

  // Get invoice by ID
  getInvoiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/`, {
      headers: this.getHeaders()
    });
  }

  // Get invoice statistics
  getInvoiceStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics/`, {
      headers: this.getHeaders()
    });
  }

  // ============== CREATE & UPDATE ==============

  // Create new invoice
  postInvoice(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Update invoice
  updateInvoice(data: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Delete invoice
  deleteInvoice(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, {
      headers: this.getHeaders()
    });
  }

  // ============== INVOICE ACTIONS ==============

  // Approve invoice (PENDING -> APPROVED)
  approveInvoice(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/approve/`, {}, {
      headers: this.getHeaders()
    });
  }

  // Settle invoice (APPROVED -> SETTLED)
  settleInvoice(id: number, paymentReference: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/settle/`, {
      payment_reference: paymentReference
    }, {
      headers: this.getHeaders()
    });
  }

  // Reject invoice
  rejectInvoice(id: number, rejectionReason?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/reject/`, {
      rejection_reason: rejectionReason || 'Rejected by administrator'
    }, {
      headers: this.getHeaders()
    });
  }

  // ============== BULK OPERATIONS ==============

  // Bulk approve invoices
  bulkApproveInvoices(invoiceIds: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk_approve/`, {
      invoice_ids: invoiceIds
    }, {
      headers: this.getHeaders()
    });
  }

  // Bulk settle invoices
  bulkSettleInvoices(invoiceIds: number[], paymentReference: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk_settle/`, {
      invoice_ids: invoiceIds,
      payment_reference: paymentReference
    }, {
      headers: this.getHeaders()
    });
  }

  // ============== RELATED DATA ==============

  // Get all subsidies
  getSubsidies(): Observable<any[]> {
    return this.http.get<any>(`${this.subsidyUrl}/`, {
      headers: this.getHeaders()
    }).pipe(map(res => res.results || res));
  }

  // Get active subsidies
  getActiveSubsidies(): Observable<any[]> {
    return this.http.get<any>(`${this.subsidyUrl}/`, {
      headers: this.getHeaders(),
      params: { status: 'ACTIVE' }
    }).pipe(map(res => res.results || res));
  }

  // Get invoices with details
  getWithDetails(): Observable<any> {
    return this.http.get(`${this.baseUrl}/with_details/`, {
      headers: this.getHeaders()
    });
  }
}
