import { Component, OnInit } from '@angular/core';
import { InvoiceService } from 'src/app/shared/invoice';


@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.css']
})
export class ApprovedComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  loading = false;
  error = '';
  success = '';

  // View details modal
  showDetailsModal = false;
  selectedInvoice: any = null;

  // Filters
  searchTerm = '';
  dateFrom = '';
  dateTo = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadApprovedInvoices();
  }

  loadApprovedInvoices() {
    this.loading = true;
    this.error = '';

    this.invoiceService.getApprovedInvoices().subscribe({
      next: (res) => {
        this.invoices = res;
        this.applyFilters();
        this.loading = false;
        console.log('Approved invoices:', this.invoices);
      },
      error: (err) => {
        console.error('Error loading approved invoices:', err);
        this.error = 'Failed to load approved invoices';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.invoices];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoice_number?.toLowerCase().includes(term) ||
        invoice.organisation_name?.toLowerCase().includes(term) ||
        invoice.subsidy_name?.toLowerCase().includes(term)
      );
    }

    // Date range filter
    if (this.dateFrom) {
      filtered = filtered.filter(invoice =>
        new Date(invoice.approved_date) >= new Date(this.dateFrom)
      );
    }

    if (this.dateTo) {
      filtered = filtered.filter(invoice =>
        new Date(invoice.approved_date) <= new Date(this.dateTo)
      );
    }

    this.filteredInvoices = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredInvoices.length / this.pageSize);
  }

  get paginatedInvoices() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredInvoices.slice(start, end);
  }

  openDetailsModal(invoice: any) {
    this.selectedInvoice = invoice;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedInvoice = null;
  }

  getTotalAmount(): number {
    return this.filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  exportToExcel() {
    const headers = [
      'Invoice Number',
      'Organisation',
      'Subsidy',
      'Amount',
      'Approved Date',
      'Approved By'
    ];

    const rows = this.filteredInvoices.map(invoice => [
      invoice.invoice_number,
      invoice.organisation_name,
      invoice.subsidy_name,
      invoice.amount.toString(),
      this.formatDate(invoice.approved_date),
      'System' // You can add approved_by field to your model
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `approved-invoices-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }
}
