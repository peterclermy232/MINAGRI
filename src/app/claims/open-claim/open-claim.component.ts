import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

interface Claim {
  claim_id: number;
  farmer_name: string;
  policy_number: string;
  claim_number: string;
  estimated_loss_amount: number;
  status: string;
  claim_date: string;
  loss_details?: any;
}

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

  private apiUrl = `${environment.apiUrl}/claims/`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOpenClaims();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  loadOpenClaims(): void {
    this.loading = true;
    this.error = '';

    this.http.get<any>(this.apiUrl, {
      headers: this.getHeaders(),
      params: { status: 'OPEN' }
    }).subscribe({
      next: (data) => {
        this.openClaims = Array.isArray(data) ? data : data.results || [];
        this.filteredClaims = this.openClaims;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load open claims';
        this.loading = false;
        console.error(err);
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
    const headers = ['Claim Number', 'Farmer Name', 'Policy Number', 'Estimated Loss', 'Claim Date'];
    const rows = this.filteredClaims.map(claim => [
      claim.claim_number,
      claim.farmer_name,
      claim.policy_number,
      claim.estimated_loss_amount.toString(),
      this.formatDate(claim.claim_date)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `open-claims-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
