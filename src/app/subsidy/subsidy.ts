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
