// open-claim.component.ts - Refactored to use ClaimService
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClaimService, Claim } from '../../shared/claim.service';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-open-claim',
  templateUrl: './open-claim.component.html',
  styleUrls: ['./open-claim.component.css']
})
export class OpenClaimComponent implements OnInit {
  openClaims: Claim[] = [];
  filteredClaims: Claim[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  selectedClaim: Claim | null = null;
  showDetailsModal = false;

  constructor(
    private claimService: ClaimService,
    private router: Router,
    private notifier: NotifierService
  ) {}

  ngOnInit(): void {
    this.loadOpenClaims();
  }

  loadOpenClaims(): void {
    this.loading = true;
    this.error = '';

    this.claimService.getClaimsByStatus('OPEN').subscribe({
      next: (data) => {
        this.openClaims = data;
        this.filteredClaims = data;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load open claims';
        this.loading = false;
        this.notifier.showToast({
          typ: 'error',
          message: err.message || 'Failed to load open claims'
        });
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClaims = [...this.openClaims];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClaims = this.openClaims.filter(claim =>
        claim.claim_number.toLowerCase().includes(term) ||
        claim.farmer_name.toLowerCase().includes(term) ||
        claim.policy_number.toLowerCase().includes(term)
      );
    }
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

  assignToAssessor(claim: Claim): void {
    // Navigate to pending claims where assignment happens
    this.router.navigate(['/claims/pending']);
  }

  formatCurrency(amount: number): string {
    return this.claimService.formatCurrency(amount);
  }

  formatDate(dateString: string): string {
    return this.claimService.formatDate(dateString);
  }

  exportToExcel(): void {
    this.claimService.exportToCSV(this.filteredClaims, 'open-claims');
    this.notifier.showToast({
      typ: 'success',
      message: 'Claims exported successfully'
    });
  }

  getTotalEstimatedLoss(): number {
    return this.filteredClaims.reduce((sum, claim) => sum + claim.estimated_loss_amount, 0);
  }
  getMin(a: number, b: number): number {
  return Math.min(a, b);
}
}
