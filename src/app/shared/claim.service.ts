// claim.service.ts - Enhanced version for your existing shared folder
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface ClaimCreateRequest {
  farmer: number;
  quotation: number;
  claim_number: string;
  estimated_loss_amount: number;
  status: string;
  loss_details: {
    loss_type: string;
    loss_date: string;
    affected_area_size: number;
    affected_area_unit: string;
    loss_description: string;
    immediate_cause: string;
    location: {
      province: string;
      district: string;
      sector?: string;
    };
    witness?: {
      name: string;
      contact: string;
    } | null;
    police_report_number?: string | null;
  };
}

export interface Claim {
  claim_id: number;
  farmer: number;
  farmer_name: string;
  quotation: number;
  policy_number: string;
  claim_number: string;
  estimated_loss_amount: number;
  approved_amount?: number;
  status: string;
  claim_date: string;
  approval_date?: string;
  payment_date?: string;
  payment_reference?: string;
  loss_assessor?: number;
  loss_assessor_name?: string;
}

export interface ClaimStatistics {
  total_claims: number;
  by_status: Array<{ status: string; count: number }>;
  total_claimed: number;
  total_approved: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private baseUrl = `${environment.apiUrl}/claims`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Create a new claim
   */
  createClaim(claimData: ClaimCreateRequest): Observable<Claim> {
    return this.http.post<Claim>(`${this.baseUrl}/`, claimData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('Claim created successfully:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get all claims with optional filters
   */
  getClaims(params?: {
    status?: string;
    farmer_id?: number;
    loss_assessor_id?: number;
  }): Observable<Claim[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.farmer_id) httpParams = httpParams.set('farmer_id', params.farmer_id.toString());
      if (params.loss_assessor_id) httpParams = httpParams.set('loss_assessor_id', params.loss_assessor_id.toString());
    }

    return this.http.get<any>(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(response => Array.isArray(response) ? response : response.results || []),
      catchError(this.handleError)
    );
  }

  /**
   * Get single claim by ID
   */
  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(`${this.baseUrl}/${id}/`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Update claim
   */
  updateClaim(id: number, data: Partial<Claim>): Observable<Claim> {
    return this.http.patch<Claim>(`${this.baseUrl}/${id}/`, data, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Assign loss assessor to claim
   */
  assignAssessor(claimId: number, assessorId: number): Observable<Claim> {
    return this.http.post<Claim>(
      `${this.baseUrl}/${claimId}/assign_assessor/`,
      { assessor_id: assessorId },
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Approve claim with approved amount
   */
  approveClaim(claimId: number, approvedAmount: number): Observable<Claim> {
    return this.http.post<Claim>(
      `${this.baseUrl}/${claimId}/approve/`,
      { approved_amount: approvedAmount },
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Get claim statistics
   */
  getStatistics(): Observable<ClaimStatistics> {
    return this.http.get<ClaimStatistics>(`${this.baseUrl}/statistics/`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get claims by status
   */
  getClaimsByStatus(status: string): Observable<Claim[]> {
    return this.getClaims({ status });
  }

  /**
   * Get open claims (pending assessment)
   */
  getOpenClaims(): Observable<Claim[]> {
    return this.getClaimsByStatus('OPEN');
  }

  /**
   * Get claims under assessment
   */
  getClaimsUnderAssessment(): Observable<Claim[]> {
    return this.getClaimsByStatus('UNDER_ASSESSMENT');
  }

  /**
   * Get claims pending payment
   */
  getClaimsPendingPayment(): Observable<Claim[]> {
    return this.getClaimsByStatus('PENDING_PAYMENT');
  }

  /**
   * Get paid claims
   */
  getPaidClaims(): Observable<Claim[]> {
    return this.getClaimsByStatus('PAID');
  }

  /**
   * Get claims for specific farmer
   */
  getFarmerClaims(farmerId: number): Observable<Claim[]> {
    return this.getClaims({ farmer_id: farmerId });
  }

  /**
   * Export claims to CSV
   */
  exportToCSV(claims: Claim[], filename: string = 'claims'): void {
    const headers = [
      'Claim Number',
      'Farmer Name',
      'Policy Number',
      'Estimated Loss',
      'Approved Amount',
      'Status',
      'Claim Date',
      'Approval Date'
    ];

    const rows = claims.map(claim => [
      claim.claim_number,
      claim.farmer_name,
      claim.policy_number,
      claim.estimated_loss_amount.toString(),
      claim.approved_amount?.toString() || 'N/A',
      claim.status,
      this.formatDate(claim.claim_date),
      claim.approval_date ? this.formatDate(claim.approval_date) : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'RWF'): string {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Generate claim number
   */
  generateClaimNumber(farmerId: number): string {
    const timestamp = new Date().getTime();
    return `CLM-${timestamp}-${farmerId}`;
  }

  /**
   * Validate claim amount against sum insured
   */
  validateClaimAmount(claimAmount: number, sumInsured: number): boolean {
    return claimAmount > 0 && claimAmount <= sumInsured;
  }

  /**
   * Error handler
   */
  private handleError(error: any): Observable<never> {
    console.error('Claim Service Error:', error);

    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.detail ||
                     error.error?.message ||
                     error.message ||
                     `Error Code: ${error.status}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
