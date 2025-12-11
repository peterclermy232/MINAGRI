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
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  paymentPendingClaims: Claim[] = [];
  loading = false;
  error = '';
  success = '';
  selectedClaim: Claim | null = null;
  showPaymentModal = false;
  paymentReference = '';
  paymentDate: string = new Date().toISOString().split('T')[0];

  private apiUrl = `${environment.apiUrl}/claims/`;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadPaymentPendingClaims();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  loadPaymentPendingClaims(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    // Load claims with PENDING_PAYMENT status
    this.http.get<Claim[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params: { status: 'PENDING_PAYMENT' }
    }).subscribe({
      next: (data) => {
        this.paymentPendingClaims = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load payment pending claims';
        this.loading = false;
        console.error(err);
      }
    });
  }

  openPaymentModal(claim: Claim): void {
    this.selectedClaim = claim;
    this.paymentReference = `PAY-${claim.claim_number}-${Date.now()}`;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedClaim = null;
    this.paymentReference = '';
    this.paymentDate = new Date().toISOString().split('T')[0];
  }

  processPayment(): void {
    if (!this.selectedClaim || !this.paymentReference) {
      this.error = 'Payment reference is required';
      return;
    }

    this.loading = true;
    this.error = '';

    // Update claim status to PAID
    this.http.patch(
      `${this.apiUrl}${this.selectedClaim.claim_id}/`,
      {
        status: 'PAID',
        payment_reference: this.paymentReference,
        payment_date: this.paymentDate
      },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.success = `Payment processed successfully for ${this.selectedClaim?.claim_number}`;
        this.closePaymentModal();
        this.loadPaymentPendingClaims();
        this.loading = false;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to process payment';
        this.loading = false;
        console.error(err);
      }
    });
  }

  exportToExcel(): void {
    // Convert claims data to CSV/Excel format
    const headers = ['Claim Number', 'Farmer Name', 'Policy Number', 'Approved Amount', 'Approval Date'];
    const rows = this.paymentPendingClaims.map(claim => [
      claim.claim_number,
      claim.farmer_name,
      claim.policy_number,
      claim.approved_amount.toString(),
      this.formatDate(claim.approval_date)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-pending-claims-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getTotalPaymentAmount(): number {
    return this.paymentPendingClaims.reduce((sum, claim) => sum + claim.approved_amount, 0);
  }

  viewClaimDetails(claim: Claim): void {
    console.log('View details for claim:', claim.claim_number);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
