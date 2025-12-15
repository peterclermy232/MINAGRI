// payment.component.ts - Complete Implementation with ClaimService
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ClaimService, Claim } from '../../shared/claim.service';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  paymentPendingClaims: Claim[] = [];
  filteredClaims: Claim[] = [];
  loading = false;
  error = '';
  success = '';
  searchTerm = '';

  selectedClaim: Claim | null = null;
  showPaymentModal = false;
  paymentReference = '';
  paymentDate: string = new Date().toISOString().split('T')[0];
  paymentMethod = 'BANK_TRANSFER';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Payment Methods
  paymentMethods = [
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'CASH', label: 'Cash' }
  ];

  private apiUrl = `${environment.apiUrl}/claims/`;

  // Add Math for template
  Math = Math;

  constructor(
    private http: HttpClient,
    private claimService: ClaimService,
    private notifier: NotifierService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadPaymentPendingClaims();

    // Check if navigated from approved claims with specific claim
    this.route.queryParams.subscribe(params => {
      if (params['claimId']) {
        const claimId = parseInt(params['claimId']);
        this.claimService.getClaimById(claimId).subscribe({
          next: (claim) => {
            this.openPaymentModal(claim);
          },
          error: (err) => {
            console.error('Error loading claim:', err);
          }
        });
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  loadPaymentPendingClaims(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.claimService.getClaimsPendingPayment().subscribe({
      next: (data) => {
        this.paymentPendingClaims = data;
        this.filteredClaims = data;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load payment pending claims';
        this.loading = false;
        this.notifier.showToast({
          typ: 'error',
          message: err.message || 'Failed to load claims'
        });
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClaims = [...this.paymentPendingClaims];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClaims = this.paymentPendingClaims.filter(claim =>
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

  openPaymentModal(claim: Claim): void {
    this.selectedClaim = claim;
    // Generate payment reference
    this.paymentReference = `PAY-${claim.claim_number}-${Date.now()}`;
    this.paymentDate = new Date().toISOString().split('T')[0];
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedClaim = null;
    this.paymentReference = '';
    this.paymentDate = new Date().toISOString().split('T')[0];
    this.paymentMethod = 'BANK_TRANSFER';
  }

  processPayment(): void {
    if (!this.selectedClaim || !this.paymentReference.trim()) {
      this.notifier.showToast({
        typ: 'error',
        message: 'Payment reference is required'
      });
      return;
    }

    // Confirm before processing
    this.notifier.showSweetAlert({
      typ: 'warning',
      message: `Are you sure you want to process payment of ${this.formatCurrency(this.selectedClaim.approved_amount || 0)} for claim ${this.selectedClaim.claim_number}?`,
      confirm: true
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.executePayment();
      }
    });
  }

  private executePayment(): void {
    if (!this.selectedClaim) return;

    this.loading = true;
    this.error = '';

    // Update claim status to PAID
    this.http.patch(
      `${this.apiUrl}${this.selectedClaim.claim_id}/`,
      {
        status: 'PAID',
        payment_reference: `${this.paymentMethod}:${this.paymentReference}`,
        payment_date: this.paymentDate
      },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.loading = false;
        const paidAmount = this.selectedClaim?.approved_amount || 0;
        const claimNumber = this.selectedClaim?.claim_number || '';

        this.notifier.showSweetAlert({
          typ: 'success',
          message: `Payment of ${this.formatCurrency(paidAmount)} processed successfully for claim ${claimNumber}`
        });

        this.closePaymentModal();
        this.loadPaymentPendingClaims();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to process payment';
        this.notifier.showToast({
          typ: 'error',
          message: err.message || 'Failed to process payment'
        });
      }
    });
  }

  viewClaimDetails(claim: Claim): void {
    this.selectedClaim = claim;
    // Could open a details modal or navigate to details page
    this.notifier.showToast({
      typ: 'info',
      message: `Viewing details for ${claim.claim_number}`
    });
  }

  exportToExcel(): void {
    this.claimService.exportToCSV(this.filteredClaims, 'payment-pending-claims');
    this.notifier.showToast({
      typ: 'success',
      message: 'Claims exported successfully'
    });
  }

  getTotalPaymentAmount(): number {
    return this.filteredClaims.reduce((sum, claim) => sum + (claim.approved_amount || 0), 0);
  }

  getPageTotal(): number {
    return this.paginatedClaims.reduce((sum, claim) => sum + (claim.approved_amount || 0), 0);
  }

  formatCurrency(amount: number | undefined): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .format(amount ?? 0);
}

  formatDate(date: string | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString();
}

  // Pagination methods
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

}
