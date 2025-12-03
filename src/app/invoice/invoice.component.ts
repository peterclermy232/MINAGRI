import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Invoice {
  invoice_id: number;
  organisation_name: string;
  subsidy_name: string;
  invoice_number: string;
  amount: number;
  status: string;
  approved_date?: string;
  settlement_date?: string;
  payment_reference?: string;
  date_time_added: string;
}

interface Subsidy {
  subsidy_id: number;
  subsidy_name: string;
  subsidy_rate: number;
  organisation_name: string;
  status: string;
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  subsidies: Subsidy[] = [];
  loading = false;
  error = '';
  success = '';

  // Create invoice properties
  showCreateModal = false;
  newInvoice = {
    subsidy_id: null as number | null,
    amount: 0,
    organisation_id: null as number | null
  };

  // Action modals
  selectedInvoice: Invoice | null = null;
  showApproveModal = false;
  showSettleModal = false;
  showDetailsModal = false;
  settlementReference = '';

  // Filter properties
  statusFilter = 'all';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  Math = Math;

  private apiUrl = `${environment.apiUrl}/invoices/`;
  private subsidyUrl = `${environment.apiUrl}/subsidies/`;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadInvoices();
    this.loadSubsidies();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = '';

    const params: any = {};
    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter.toUpperCase();
    }

    this.http.get<Invoice[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params: params
    }).subscribe({
      next: (data) => {
        this.invoices = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load invoices';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadSubsidies(): void {
    this.http.get<Subsidy[]>(this.subsidyUrl, {
      headers: this.getHeaders(),
      params: { status: 'ACTIVE' }
    }).subscribe({
      next: (data) => {
        this.subsidies = data;
      },
      error: (err) => {
        console.error('Failed to load subsidies', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.invoices];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(term) ||
        invoice.organisation_name.toLowerCase().includes(term) ||
        invoice.subsidy_name.toLowerCase().includes(term)
      );
    }

    this.filteredInvoices = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredInvoices.length / this.pageSize);
  }

  get paginatedInvoices(): Invoice[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredInvoices.slice(start, end);
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newInvoice = {
      subsidy_id: null,
      amount: 0,
      organisation_id: null
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newInvoice = {
      subsidy_id: null,
      amount: 0,
      organisation_id: null
    };
  }

  createInvoice(): void {
    if (!this.newInvoice.subsidy_id || !this.newInvoice.amount) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = '';

    const invoiceData = {
      subsidy: this.newInvoice.subsidy_id,
      amount: this.newInvoice.amount,
      organisation: this.newInvoice.organisation_id,
      invoice_number: `INV-${Date.now()}`,
      status: 'PENDING'
    };

    this.http.post<Invoice>(this.apiUrl, invoiceData, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.success = 'Invoice created successfully';
        this.closeCreateModal();
        this.loadInvoices();
        this.loading = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to create invoice';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openApproveModal(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showApproveModal = true;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedInvoice = null;
  }

  approveInvoice(): void {
    if (!this.selectedInvoice) return;

    this.loading = true;
    this.http.post(
      `${this.apiUrl}${this.selectedInvoice.invoice_id}/approve/`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.success = 'Invoice approved successfully';
        this.closeApproveModal();
        this.loadInvoices();
        this.loading = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to approve invoice';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openSettleModal(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.settlementReference = `SETTLE-${invoice.invoice_number}-${Date.now()}`;
    this.showSettleModal = true;
  }

  closeSettleModal(): void {
    this.showSettleModal = false;
    this.selectedInvoice = null;
    this.settlementReference = '';
  }

  settleInvoice(): void {
    if (!this.selectedInvoice || !this.settlementReference) {
      this.error = 'Settlement reference is required';
      return;
    }

    this.loading = true;
    this.http.post(
      `${this.apiUrl}${this.selectedInvoice.invoice_id}/settle/`,
      { payment_reference: this.settlementReference },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.success = 'Invoice settled successfully';
        this.closeSettleModal();
        this.loadInvoices();
        this.loading = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to settle invoice';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openDetailsModal(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedInvoice = null;
  }

  exportToExcel(): void {
    const headers = [
      'Invoice Number',
      'Organisation',
      'Subsidy',
      'Amount',
      'Status',
      'Created Date',
      'Approved Date',
      'Settlement Date',
      'Payment Reference'
    ];

    const rows = this.filteredInvoices.map(invoice => [
      invoice.invoice_number,
      invoice.organisation_name,
      invoice.subsidy_name,
      invoice.amount.toString(),
      invoice.status,
      this.formatDate(invoice.date_time_added),
      invoice.approved_date ? this.formatDate(invoice.approved_date) : 'N/A',
      invoice.settlement_date ? this.formatDate(invoice.settlement_date) : 'N/A',
      invoice.payment_reference || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getTotalAmount(): number {
    return this.filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: {[key: string]: string} = {
      'PENDING': 'badge-warning',
      'APPROVED': 'badge-info',
      'SETTLED': 'badge-success'
    };
    return statusMap[status] || 'badge-secondary';
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}
