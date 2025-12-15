// paid-claim.component.ts - Refactored with ClaimService
import { Component, OnInit } from '@angular/core';
import { ClaimService, Claim, ClaimStatistics } from '../../shared/claim.service';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-paid-claim',
  templateUrl: './paid-claim.component.html',
  styleUrls: ['./paid-claim.component.css']
})
export class PaidClaimComponent implements OnInit {
  paidClaims: Claim[] = [];
  filteredClaims: Claim[] = [];
  statistics: ClaimStatistics | null = null;

  loading = false;
  error = '';

  // Filters
  searchTerm = '';
  dateFrom = '';
  dateTo = '';

  selectedClaim: Claim | null = null;
  showDetailsModal = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Add Math for template
  Math = Math;

  constructor(
    private claimService: ClaimService,
    private notifier: NotifierService
  ) {}

  ngOnInit(): void {
    this.loadPaidClaims();
    this.loadStatistics();
  }

  loadPaidClaims(): void {
    this.loading = true;
    this.error = '';

    this.claimService.getPaidClaims().subscribe({
      next: (data) => {
        this.paidClaims = data;
        this.filteredClaims = data;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load paid claims';
        this.loading = false;
        this.notifier.showToast({
          typ: 'error',
          message: err.message || 'Failed to load paid claims'
        });
      }
    });
  }

  loadStatistics(): void {
    this.claimService.getStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: (err) => {
        console.error('Failed to load statistics:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.paidClaims];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(claim =>
        claim.claim_number.toLowerCase().includes(term) ||
        claim.farmer_name.toLowerCase().includes(term) ||
        claim.policy_number.toLowerCase().includes(term) ||
        claim.payment_reference?.toLowerCase().includes(term)
      );
    }

    // Date From filter
    if (this.dateFrom) {
      const from = new Date(this.dateFrom);
      filtered = filtered.filter(claim => {
        const paymentDate = new Date(claim.payment_date || claim.approval_date || claim.claim_date);
        return paymentDate >= from;
      });
    }

    // Date To filter
    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59, 999); // Include entire day
      filtered = filtered.filter(claim => {
        const paymentDate = new Date(claim.payment_date || claim.approval_date || claim.claim_date);
        return paymentDate <= to;
      });
    }

    this.filteredClaims = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.filteredClaims = [...this.paidClaims];
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

  getPageTotal(): number {
    return this.paginatedClaims.reduce((sum, c) => sum + (c.approved_amount || 0), 0);
  }

  getTotalPaidAmount(): number {
    return this.filteredClaims.reduce((sum, claim) => sum + (claim.approved_amount || 0), 0);
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

  openDetailsModal(claim: Claim): void {
    this.selectedClaim = claim;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedClaim = null;
  }

  printReceipt(claim: Claim): void {
    // Create a printable receipt
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.notifier.showToast({
        typ: 'error',
        message: 'Please allow popups to print receipts'
      });
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${claim.claim_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin: 20px 0; }
          .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; width: 40%; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          .amount { font-size: 24px; color: #28a745; font-weight: bold; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PAYMENT RECEIPT</h1>
          <p>Crop Insurance Claim Payment</p>
        </div>

        <div class="section">
          <h3>Claim Information</h3>
          <table>
            <tr>
              <td class="label">Claim Number:</td>
              <td>${claim.claim_number}</td>
            </tr>
            <tr>
              <td class="label">Status:</td>
              <td>PAID</td>
            </tr>
            <tr>
              <td class="label">Claim Date:</td>
              <td>${this.formatDate(claim.claim_date)}</td>
            </tr>
            <tr>
              <td class="label">Approval Date:</td>
              <td>${this.formatDate(claim.approval_date || '')}</td>
            </tr>
            <tr>
              <td class="label">Payment Date:</td>
              <td>${this.formatDate(claim.payment_date || '')}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h3>Farmer Information</h3>
          <table>
            <tr>
              <td class="label">Name:</td>
              <td>${claim.farmer_name}</td>
            </tr>
            <tr>
              <td class="label">Policy Number:</td>
              <td>${claim.policy_number}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h3>Payment Details</h3>
          <table>
            <tr>
              <td class="label">Estimated Loss:</td>
              <td>${this.formatCurrency(claim.estimated_loss_amount)}</td>
            </tr>
            <tr>
              <td class="label">Approved Amount:</td>
              <td class="amount">${this.formatCurrency(claim.approved_amount || 0)}</td>
            </tr>
            <tr>
              <td class="label">Payment Reference:</td>
              <td>${claim.payment_reference || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>This is an electronically generated receipt.</p>
          <p>Printed on: ${new Date().toLocaleString()}</p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Print Receipt
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  }

  exportToExcel(): void {
    this.claimService.exportToCSV(this.filteredClaims, 'paid-claims');
    this.notifier.showToast({
      typ: 'success',
      message: 'Claims exported successfully'
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


  // Summary statistics for display
  getPaidClaimsThisMonth(): number {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.paidClaims.filter(claim => {
      const paymentDate = new Date(claim.payment_date || claim.claim_date);
      return paymentDate >= firstDayOfMonth;
    }).length;
  }

  getTotalPaidThisMonth(): number {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.paidClaims
      .filter(claim => {
        const paymentDate = new Date(claim.payment_date || claim.claim_date);
        return paymentDate >= firstDayOfMonth;
      })
      .reduce((sum, claim) => sum + (claim.approved_amount || 0), 0);
  }

  getAveragePaymentAmount(): number {
    if (this.filteredClaims.length === 0) return 0;
    return this.getTotalPaidAmount() / this.filteredClaims.length;
  }
}
