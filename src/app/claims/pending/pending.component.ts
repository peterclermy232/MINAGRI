// pending.component.ts - Refactored with ClaimService
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ClaimService, Claim } from '../../shared/claim.service';
import { NotifierService } from '../../services/notifier.service';

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
  // Claims lists
  openClaims: Claim[] = [];
  underAssessmentClaims: Claim[] = [];
  allPendingClaims: Claim[] = [];
  filteredClaims: Claim[] = [];

  // Loss Assessors
  lossAssessors: LossAssessor[] = [];

  // UI State
  loading = false;
  error = '';
  searchTerm = '';
  statusFilter: string = 'ALL'; // ALL, OPEN, UNDER_ASSESSMENT

  // Modal State
  selectedClaim: Claim | null = null;
  selectedAssessorId: number | null = null;
  showAssignModal = false;
  showApproveModal = false;
  showDetailsModal = false;
  approvedAmount: number = 0;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  private assessorUrl = `${environment.apiUrl}/loss_assessors/`;

  constructor(
    private http: HttpClient,
    private claimService: ClaimService,
    private notifier: NotifierService
  ) {}

  ngOnInit(): void {
    this.loadPendingClaims();
    this.loadLossAssessors();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  loadPendingClaims(): void {
    this.loading = true;
    this.error = '';

    // Load both OPEN and UNDER_ASSESSMENT claims
    this.claimService.getOpenClaims().subscribe({
      next: (openData) => {
        this.openClaims = openData;

        this.claimService.getClaimsUnderAssessment().subscribe({
          next: (assessmentData) => {
            this.underAssessmentClaims = assessmentData;
            this.allPendingClaims = [...this.openClaims, ...this.underAssessmentClaims];
            this.applyFilters();
            this.loading = false;
          },
          error: (err) => {
            this.handleError('Failed to load claims under assessment', err);
          }
        });
      },
      error: (err) => {
        this.handleError('Failed to load open claims', err);
      }
    });
  }

  loadLossAssessors(): void {
    this.http.get<any>(this.assessorUrl, {
      headers: this.getHeaders(),
      params: { status: 'ACTIVE' }
    }).subscribe({
      next: (data) => {
        this.lossAssessors = Array.isArray(data) ? data : data.results || [];
        console.log('Loss assessors loaded:', this.lossAssessors.length);
      },
      error: (err) => {
        console.error('Failed to load assessors', err);
        this.notifier.showToast({
          typ: 'error',
          message: 'Failed to load loss assessors'
        });
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allPendingClaims];

    // Status Filter
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(claim => claim.status === this.statusFilter);
    }

    // Search Filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(claim =>
        claim.claim_number.toLowerCase().includes(term) ||
        claim.farmer_name.toLowerCase().includes(term) ||
        claim.policy_number.toLowerCase().includes(term) ||
        claim.loss_assessor_name?.toLowerCase().includes(term)
      );
    }

    this.filteredClaims = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredClaims.length / this.pageSize);
  }

  get paginatedClaims(): Claim[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClaims.slice(start, start + this.pageSize);
  }

  // Modal Management
  openAssignModal(claim: Claim): void {
    this.selectedClaim = claim;
    this.selectedAssessorId = null;
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedClaim = null;
    this.selectedAssessorId = null;
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

  viewClaimDetails(claim: Claim): void {
    this.selectedClaim = claim;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedClaim = null;
  }

  // Actions
  assignAssessor(): void {
    if (!this.selectedClaim || !this.selectedAssessorId) {
      this.notifier.showToast({
        typ: 'error',
        message: 'Please select a loss assessor'
      });
      return;
    }

    this.loading = true;
    this.claimService.assignAssessor(this.selectedClaim.claim_id, this.selectedAssessorId).subscribe({
      next: (updatedClaim) => {
        this.loading = false;
        this.closeAssignModal();
        this.loadPendingClaims();

        this.notifier.showSweetAlert({
          typ: 'success',
          message: `Loss assessor assigned successfully to ${updatedClaim.claim_number}`
        });
      },
      error: (err) => {
        this.loading = false;
        this.handleError('Failed to assign assessor', err);
      }
    });
  }

  approveClaim(): void {
    if (!this.selectedClaim || !this.approvedAmount) {
      this.notifier.showToast({
        typ: 'error',
        message: 'Please enter approved amount'
      });
      return;
    }

    // Validate approved amount
    if (this.approvedAmount <= 0) {
      this.notifier.showToast({
        typ: 'error',
        message: 'Approved amount must be greater than zero'
      });
      return;
    }

    if (this.approvedAmount > this.selectedClaim.estimated_loss_amount * 1.5) {
      this.notifier.showToast({
        typ: 'warning',
        message: 'Approved amount is significantly higher than estimated loss. Please verify.'
      });
    }

    this.loading = true;
    this.claimService.approveClaim(this.selectedClaim.claim_id, this.approvedAmount).subscribe({
      next: (updatedClaim) => {
        this.loading = false;
        this.closeApproveModal();
        this.loadPendingClaims();

        this.notifier.showSweetAlert({
          typ: 'success',
          message: `Claim ${updatedClaim.claim_number} approved successfully! Amount: ${this.formatCurrency(this.approvedAmount)}`
        });
      },
      error: (err) => {
        this.loading = false;
        this.handleError('Failed to approve claim', err);
      }
    });
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return this.claimService.formatCurrency(amount);
  }

  formatDate(dateString: string): string {
    return this.claimService.formatDate(dateString);
  }

  exportToExcel(): void {
    this.claimService.exportToCSV(this.filteredClaims, 'pending-claims');
    this.notifier.showToast({
      typ: 'success',
      message: 'Claims exported successfully'
    });
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'OPEN': return 'badge-warning';
      case 'UNDER_ASSESSMENT': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getTotalEstimatedLoss(): number {
    return this.filteredClaims.reduce((sum, claim) => sum + claim.estimated_loss_amount, 0);
  }

  private handleError(message: string, err: any): void {
    this.error = message;
    this.loading = false;
    console.error(message, err);
    this.notifier.showToast({
      typ: 'error',
      message: err.message || message
    });
  }

  // Add Math to template
  Math = Math;
}
