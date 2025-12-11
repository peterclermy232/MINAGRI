import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
}

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

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  selectedClaim: Claim | null = null;
  showDetailsModal = false;

  private apiUrl = `${environment.apiUrl}/claims/`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApprovedClaims();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  loadApprovedClaims(): void {
    this.loading = true;
    this.error = '';

    // Load claims with PENDING_PAYMENT status (these are approved)
    this.http.get<any>(this.apiUrl, {
      headers: this.getHeaders(),
      params: { status: 'PENDING_PAYMENT' }
    }).subscribe({
      next: (data) => {
        this.approvedClaims = Array.isArray(data) ? data : data.results || [];
        this.filteredClaims = this.approvedClaims;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load approved claims';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClaims = [...this.approvedClaims];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClaims = this.approvedClaims.filter(claim =>
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

  getTotalApprovedAmount(): number {
    return this.filteredClaims.reduce((sum, claim) => sum + claim.approved_amount, 0);
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  exportToExcel(): void {
    const headers = ['Claim Number', 'Farmer Name', 'Policy Number', 'Approved Amount', 'Approval Date'];
    const rows = this.filteredClaims.map(claim => [
      claim.claim_number,
      claim.farmer_name,
      claim.policy_number,
      claim.approved_amount.toString(),
      this.formatDate(claim.approval_date)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `approved-claims-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
