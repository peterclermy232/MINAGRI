export class InvoiceModel {
  invoice_id: number = 0;
  organisation: number = 0;
  subsidy: number = 0;
  invoice_number: string = '';
  amount: number = 0;
  status: string = 'PENDING'; // PENDING, APPROVED, SETTLED, REJECTED
  approved_date?: Date;
  settlement_date?: Date;
  payment_reference?: string;
  date_time_added?: Date;

  // Read-only fields from backend
  organisation_name?: string;
  subsidy_name?: string;
}

// subsidy.model.ts (if not already created)
export class SubsidyModel {
  subsidy_id: number = 0;
  organisation: number = 0;
  insurance_product: number = 0;
  subsidy_name: string = '';
  subsidy_rate: number = 0;
  status: string = 'ACTIVE';
  date_time_added?: Date;

  // Read-only fields from backend
  organisation_name?: string;
  product_name?: string;
}

// Invoice status enum for type safety
export enum InvoiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SETTLED = 'SETTLED',
  REJECTED = 'REJECTED'
}

// Invoice workflow helper
export class InvoiceWorkflow {
  static getNextStatus(currentStatus: InvoiceStatus): InvoiceStatus | null {
    switch (currentStatus) {
      case InvoiceStatus.PENDING:
        return InvoiceStatus.APPROVED;
      case InvoiceStatus.APPROVED:
        return InvoiceStatus.SETTLED;
      case InvoiceStatus.SETTLED:
        return null; // Terminal state
      default:
        return null;
    }
  }

  static canApprove(status: InvoiceStatus): boolean {
    return status === InvoiceStatus.PENDING;
  }

  static canSettle(status: InvoiceStatus): boolean {
    return status === InvoiceStatus.APPROVED;
  }

  static canReject(status: InvoiceStatus): boolean {
    return status === InvoiceStatus.PENDING || status === InvoiceStatus.APPROVED;
  }

  static getStatusBadgeClass(status: string): string {
    const statusMap: {[key: string]: string} = {
      'PENDING': 'bg-warning',
      'APPROVED': 'bg-info',
      'SETTLED': 'bg-success',
      'REJECTED': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
  }

  static getStatusIcon(status: string): string {
    const iconMap: {[key: string]: string} = {
      'PENDING': 'bi-clock-history',
      'APPROVED': 'bi-check-circle',
      'SETTLED': 'bi-cash-coin',
      'REJECTED': 'bi-x-circle'
    };
    return iconMap[status] || 'bi-question-circle';
  }
}
