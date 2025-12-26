// product-insurance.model.ts
export class ProductInsurance {
  product_id?: number;
  organisation: number;
  product_category: number;
  season: number;
  crop: number;
  crop_variety?: number;
  product_name: string;
  average_premium_rate: number;
  sum_insured: number;
  status: string;
  date_time_added?: Date;

  // Additional fields for display
  organisation_name?: string;
  product_category_name?: string;
  season_name?: string;
  crop_name?: string;
  crop_variety_name?: string;

  constructor() {
    this.product_name = '';
    this.average_premium_rate = 0;
    this.sum_insured = 0;
    this.status = 'ACTIVE';
    this.organisation = 0;
    this.product_category = 0;
    this.season = 0;
    this.crop = 0;
  }
}

export interface Season {
  season_id: number;
  season: string;
  start_date: string;
  end_date: string;
  status: boolean;
}

export interface LoadingParameter {
  loading_id?: number;
  loading_name: string;
  organisation: number;
  loading_type: string; // 'PERCENTAGE' or 'FIXED'
  parameter_name: string;
  value: number;
}
