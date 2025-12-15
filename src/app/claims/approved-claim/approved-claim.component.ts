// approved-claim.component.ts - Complete Implementation
import { Component, OnInit } from '@angular/core';
import { ClaimService, Claim } from '../../shared/claim.service';
import { NotifierService } from '../../services/notifier.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-approved-claim',
  templateUrl: './approved-claim.component.html',
  styleUrls: ['./approved-claim.component.css']
})
export class ApprovedClaimComponent implements OnInit {
  approvedClaims: Claim[] = [];
  filteredClaims: Claim[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  dateFrom = '';
  dateTo = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  selectedClaim: Claim | null = null;
  showDetailsModal = false;

  // Add Math for template
  Math = Math;

  constructor(
    private claimService: ClaimService,
    private notifier: NotifierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApprovedClaims();
  }

  loadApprovedClaims(): void {
    this.loading = true;
    this.error = '';

    // PENDING_PAYMENT status means claims are approved but not yet paid
    this.claimService.getClaimsPendingPayment().subscribe({
      next: (data) => {
        this.approvedClaims = data;
        this.filteredClaims = data;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load approved claims';
        this.loading = false;
        this.notifier.showToast({
          typ: 'error',
          message: err.message || 'Failed to load approved claims'
        });
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.approvedClaims];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(claim =>
        claim.claim_number.toLowerCase().includes(term) ||
        claim.farmer_name.toLowerCase().includes(term) ||
        claim.policy_number.toLowerCase().includes(term)
      );
    }

    // Date filters
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(claim =>
        new Date(claim.approval_date || claim.claim_date) >= fromDate
      );
    }

    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      filtered = filtered.filter(claim =>
        new Date(claim.approval_date || claim.claim_date) <= toDate
      );
    }

    this.filteredClaims = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredClaims = [...this.approvedClaims];
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredClaims.length / this.pageSize);
  }

  get paginatedClaims(): Claim[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClaims.slice(start, start + this.pageSize);
  }

  getTotalApprovedAmount(): number {
    return this.filteredClaims.reduce((sum, claim) => sum + (claim.approved_amount || 0), 0);
  }

  getPageTotal(): number {
    return this.paginatedClaims.reduce((sum, claim) => sum + (claim.approved_amount || 0), 0);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  viewDetails(claim: Claim): void {
    this.selectedClaim = claim;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedClaim = null;
  }

  processPayment(claim: Claim): void {
    // Navigate to payment page with claim info
    this.router.navigate(['/claims/payment'], {
      queryParams: { claimId: claim.claim_id }
    });
  }

  formatCurrency(amount: number | undefined): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .format(amount ?? 0);
}


  formatDate(date: string | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString();
}


  exportToExcel(): void {
    this.claimService.exportToCSV(this.filteredClaims, 'approved-claims');
    this.notifier.showToast({
      typ: 'success',
      message: 'Claims exported successfully'
    });
  }
}
