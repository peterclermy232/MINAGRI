import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// Claim interface
interface Claim {
  claim_id: number;
  farmer_name: string;
  policy_number: string;
  claim_number: string;
  estimated_loss_amount: number;
  approved_amount: number;
  status: string;
  claim_date: string;
  approval_date: string;
  payment_date?: string;
  payment_reference?: string;
}

// Statistics interface
interface ClaimStatistics {
  total_claims: number;
  by_status: Array<{ status: string; count: number }>;
  total_claimed: number;
  total_approved: number;
}

@Component({
  selector: 'app-paid-claim',
  templateUrl: './paid-claim.component.html',
  styleUrls: ['./paid-claim.component.css'],
})
export class PaidClaimComponent implements OnInit {
  // ADD THIS LINE - Make Math accessible in template
  Math = Math;

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

  private apiUrl = `${environment.apiUrl}/claims/`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPaidClaims();
    this.loadStatistics();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  loadPaidClaims(): void {
    this.loading = true;
    this.error = '';

    this.http
      .get<Claim[]>(this.apiUrl, {
        headers: this.getHeaders(),
        params: { status: 'PAID' },
      })
      .subscribe({
        next: (data) => {
          this.paidClaims = data;
          this.filteredClaims = data;
          this.updatePagination();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load paid claims';
          this.loading = false;
        },
      });
  }

  loadStatistics(): void {
    this.http
      .get<ClaimStatistics>(`${this.apiUrl}statistics/`, {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (data) => {
          this.statistics = data;
        },
        error: () => {},
      });
  }

  applyFilters(): void {
    let filtered = [...this.paidClaims];

    // Search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (claim) =>
          claim.claim_number.toLowerCase().includes(term) ||
          claim.farmer_name.toLowerCase().includes(term) ||
          claim.policy_number.toLowerCase().includes(term)
      );
    }

    // Date From
    if (this.dateFrom) {
      const from = new Date(this.dateFrom);
      filtered = filtered.filter(
        (claim) => new Date(claim.payment_date || claim.claim_date) >= from
      );
    }

    // Date To
    if (this.dateTo) {
      const to = new Date(this.dateTo);
      filtered = filtered.filter(
        (claim) => new Date(claim.payment_date || claim.claim_date) <= to
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

  // ADD THIS METHOD - Calculate page total
  getPageTotal(): number {
    return this.paginatedClaims.reduce((sum, c) => sum + c.approved_amount, 0);
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

  exportToExcel(): void {
    const headers = [
      'Claim Number',
      'Farmer Name',
      'Policy Number',
      'Estimated Loss',
      'Approved Amount',
      'Claim Date',
      'Approval Date',
      'Payment Date',
      'Payment Reference',
    ];

    const rows = this.filteredClaims.map((claim) => [
      claim.claim_number,
      claim.farmer_name,
      claim.policy_number,
      claim.estimated_loss_amount.toString(),
      claim.approved_amount.toString(),
      this.formatDate(claim.claim_date),
      this.formatDate(claim.approval_date),
      claim.payment_date ? this.formatDate(claim.payment_date) : 'N/A',
      claim.payment_reference || 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
      '\n'
    );

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `paid-claims-${new Date()
      .toISOString()
      .split('T')[0]}.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  getTotalPaidAmount(): number {
    return this.filteredClaims.reduce(
      (sum, claim) => sum + claim.approved_amount,
      0
    );
  }

  printReceipt(claim: Claim): void {
    window.print();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
