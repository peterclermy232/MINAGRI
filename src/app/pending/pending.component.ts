import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Claim {
  claim_id: number;
  farmer_name: string;
  policy_number: string;
  claim_number: string;
  estimated_loss_amount: number;
  approved_amount?: number;
  status: string;
  claim_date: string;
  approval_date?: string;
}

interface LossAssessor {
  assessor_id: number;
  user_name: string;
  organisation_name: string;
  status: string;
}

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.css']
})
export class PendingComponent implements OnInit {
  pendingClaims: Claim[] = [];
  lossAssessors: LossAssessor[] = [];
  loading = false;
  error = '';
  selectedClaim: Claim | null = null;
  selectedAssessorId: number | null = null;
  showAssignModal = false;
  showApproveModal = false;
  approvedAmount: number = 0;

  private apiUrl = `${environment.apiUrl}/claims/`;
  private assessorUrl = `${environment.apiUrl}/loss_assessors/`;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadPendingClaims();
    this.loadLossAssessors();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  loadPendingClaims(): void {
    this.loading = true;
    this.error = '';

    // Load claims with OPEN or UNDER_ASSESSMENT status
    this.http.get<Claim[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params: { status: 'OPEN,UNDER_ASSESSMENT' }
    }).subscribe({
      next: (data) => {
        this.pendingClaims = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load pending claims';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadLossAssessors(): void {
    this.http.get<LossAssessor[]>(this.assessorUrl, {
      headers: this.getHeaders(),
      params: { status: 'ACTIVE' }
    }).subscribe({
      next: (data) => {
        this.lossAssessors = data;
      },
      error: (err) => {
        console.error('Failed to load assessors', err);
      }
    });
  }

  openAssignModal(claim: Claim): void {
    this.selectedClaim = claim;
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedClaim = null;
    this.selectedAssessorId = null;
  }

  assignAssessor(): void {
    if (!this.selectedClaim || !this.selectedAssessorId) {
      return;
    }

    this.loading = true;
    this.http.post(
      `${this.apiUrl}${this.selectedClaim.claim_id}/assign_assessor/`,
      { assessor_id: this.selectedAssessorId },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.closeAssignModal();
        this.loadPendingClaims();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to assign assessor';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openApproveModal(claim: Claim): void {
    this.selectedClaim = claim;
    this.approvedAmount = claim.estimated_loss_amount;
    this.showApproveModal = true;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedClaim = null;
    this.approvedAmount = 0;
  }

  approveClaim(): void {
    if (!this.selectedClaim || !this.approvedAmount) {
      return;
    }

    this.loading = true;
    this.http.post(
      `${this.apiUrl}${this.selectedClaim.claim_id}/approve/`,
      { approved_amount: this.approvedAmount },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.closeApproveModal();
        this.loadPendingClaims();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to approve claim';
        this.loading = false;
        console.error(err);
      }
    });
  }

  viewClaimDetails(claim: Claim): void {
    // Navigate to claim details page or show modal
    console.log('View details for claim:', claim.claim_number);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
