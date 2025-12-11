import { Component, OnInit } from '@angular/core';
import { InvoiceService } from 'src/app/shared/invoice';


@Component({
  selector: 'app-pending-settlement',
  templateUrl: './pending-settlement.component.html',
  styleUrls: ['./pending-settlement.component.css']
})
export class PendingSettlementComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  loading = false;
  error = '';
  success = '';

  // Selection for bulk operations
  selectedInvoices: Set<number> = new Set();
  selectAll = false;

  // Settlement modal
  showSettleModal = false;
  selectedInvoice: any = null;
  settlementReference = '';

  // Bulk settlement
  showBulkSettleModal = false;
  bulkPaymentReference = '';

  // Filters
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.loadPendingInvoices();
  }

  loadPendingInvoices() {
    this.loading = true;
    this.error = '';

    // Get APPROVED invoices (pending settlement)
    this.invoiceService.getPendingInvoices().subscribe({
      next: (res) => {
        this.invoices = res;
        this.applyFilters();
        this.loading = false;
        console.log('Pending settlement invoices:', this.invoices);
      },
      error: (err) => {
        console.error('Error loading pending invoices:', err);
        this.error = 'Failed to load pending settlement invoices';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.invoices];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoice_number?.toLowerCase().includes(term) ||
        invoice.organisation_name?.toLowerCase().includes(term) ||
        invoice.subsidy_name?.toLowerCase().includes(term)
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

  // Single invoice settlement
  openSettleModal(invoice: any) {
    this.selectedInvoice = invoice;
    this.settlementReference = `PAY-${invoice.invoice_number}-${Date.now()}`;
    this.showSettleModal = true;
  }

  closeSettleModal() {
    this.showSettleModal = false;
    this.selectedInvoice = null;
    this.settlementReference = '';
  }

  settleInvoice() {
    if (!this.settlementReference) {
      this.error = 'Payment reference is required';
      return;
    }

    this.loading = true;
    this.invoiceService.settleInvoice(
      this.selectedInvoice.invoice_id,
      this.settlementReference
    ).subscribe({
      next: (res) => {
        this.success = 'Invoice settled successfully!';
        this.closeSettleModal();
        this.loadPendingInvoices();
        this.loading = false;

        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        console.error('Error settling invoice:', err);
        this.error = 'Failed to settle invoice';
        this.loading = false;
      }
    });
  }

  // Bulk operations
  toggleSelection(invoiceId: number) {
    if (this.selectedInvoices.has(invoiceId)) {
      this.selectedInvoices.delete(invoiceId);
    } else {
      this.selectedInvoices.add(invoiceId);
    }
    this.updateSelectAll();
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;

    if (this.selectAll) {
      this.paginatedInvoices.forEach(invoice => {
        this.selectedInvoices.add(invoice.invoice_id);
      });
    } else {
      this.selectedInvoices.clear();
    }
  }

  updateSelectAll() {
    const currentPageIds = this.paginatedInvoices.map(i => i.invoice_id);
    this.selectAll = currentPageIds.every(id => this.selectedInvoices.has(id));
  }

  isSelected(invoiceId: number): boolean {
    return this.selectedInvoices.has(invoiceId);
  }

  openBulkSettleModal() {
    if (this.selectedInvoices.size === 0) {
      this.error = 'Please select at least one invoice';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    this.bulkPaymentReference = `BULK-PAY-${Date.now()}`;
    this.showBulkSettleModal = true;
  }

  closeBulkSettleModal() {
    this.showBulkSettleModal = false;
    this.bulkPaymentReference = '';
  }

  bulkSettleInvoices() {
    if (!this.bulkPaymentReference) {
      this.error = 'Payment reference is required';
      return;
    }

    this.loading = true;
    const invoiceIds = Array.from(this.selectedInvoices);

    this.invoiceService.bulkSettleInvoices(
      invoiceIds,
      this.bulkPaymentReference
    ).subscribe({
      next: (res) => {
        this.success = `${res.count} invoices settled successfully!`;
        this.closeBulkSettleModal();
        this.selectedInvoices.clear();
        this.selectAll = false;
        this.loadPendingInvoices();
        this.loading = false;

        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        console.error('Error in bulk settlement:', err);
        this.error = 'Failed to settle invoices';
        this.loading = false;
      }
    });
  }

  getTotalAmount(): number {
    return this.filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  }

  getSelectedAmount(): number {
    return this.invoices
      .filter(inv => this.selectedInvoices.has(inv.invoice_id))
      .reduce((sum, inv) => sum + inv.amount, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  exportToExcel() {
    const headers = [
      'Invoice Number',
      'Organisation',
      'Subsidy',
      'Amount',
      'Approved Date'
    ];

    const rows = this.filteredInvoices.map(invoice => [
      invoice.invoice_number,
      invoice.organisation_name,
      invoice.subsidy_name,
      invoice.amount.toString(),
      this.formatDate(invoice.approved_date)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pending-settlement-${new Date().toISOString().split('T')[0]}.csv`;
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
}
