// ==================== CROP TYPES ====================

export interface Crop {
  crop_id: number;
  cropId?: number; // Alias for backward compatibility
  organisation: number;
  organisationId?: number; // Alias for backward compatibility
  organisation_name?: string; // From serializer
  crop: string;
  icon?: string;
  status: boolean;
  deleted: boolean;
  record_version: number;
  recordVersion?: number; // Alias for backward compatibility
  date_time_added: string;
  added_by?: number;
}

export interface CropVariety {
  crop_variety_id: number;
  cropVarietyId?: number; // Alias for backward compatibility
  crop: number; // Foreign key to Crop
  cropId?: number; // Alias for backward compatibility
  crop_name?: string; // From serializer
  organisation: number; // Foreign key to Organisation
  organisationId?: number; // Alias for backward compatibility
  organisation_name?: string; // From serializer
  crop_variety: string;
  cropVariety?: string; // Alias for backward compatibility
  status: boolean;
  deleted: boolean;
  record_version: number;
  recordVersion?: number; // Alias for backward compatibility
  date_time_added: string;
}

// ==================== ORGANIZATION TYPES ====================

export interface Country {
  country_id: number;
  country: string;
  country_code: string;
  country_is_deleted: boolean;
  record_version: number;
  date_time_added: string;
  date_time_modified: string;
  added_by?: number;
  modified_by?: number;
  source_ip?: string;
  latest_ip?: string;
}

export interface OrganizationType {
  organisation_type_id: number;
  organisation_type: string;
  organisation_type_description?: string;
  organisation_type_status: string;
  record_version: number;
  date_time_added: string;
  date_time_modified: string;
  added_by?: number;
  modified_by?: number;
}

export interface Organization {
  organisation_id: number;
  country: number;
  country_name?: string;
  organisation_type: number;
  organisation_type_name?: string;
  organisation_code: string;
  organisation_name: string;
  organisation_email: string;
  organisation_msisdn: string;
  organisation_contact: string;
  organisation_physical_address?: string;
  organisation_status: string;
  organisation_is_deleted: boolean;
  failed_login_threshold: number;
  failed_login_backoff: number;
  record_version: number;
  date_time_added: string;
  date_time_modified: string;
  added_by?: number;
  modified_by?: number;
  source_ip?: string;
  latest_ip?: string;
}

// ==================== USER TYPES ====================

export interface User {
  user_id: number;
  organisation: number;
  organisation_name?: string;
  country?: number;
  country_name?: string;
  user_role: string;
  user_name: string;
  user_email: string;
  user_phone_number?: string;
  user_status: string;
  failed_logins: number;
  locked_till_date_time?: string;
  reset_code?: string;
  reset_password: boolean;
  date_time_added: string;
  is_staff: boolean;
  user_is_active: boolean;
  first_name?: string;
  last_name?: string;
}

// ==================== FARMER TYPES ====================

export interface Farmer {
  farmer_id: number;
  organisation: number;
  organisation_name?: string;
  country?: number;
  country_name?: string;
  first_name: string;
  last_name: string;
  id_number: string;
  phone_number: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  farmer_category?: string;
  status: string;
  date_time_added: string;
  farms?: Farm[];
  bank_accounts?: BankAccount[];
  next_of_kin?: NextOfKin[];
}

export interface Farm {
  farm_id: number;
  farmer: number;
  farm_name: string;
  farm_size: number;
  unit_of_measure: string;
  location_province?: string;
  location_district?: string;
  location_sector?: string;
  status: string;
  date_time_added: string;
}

export interface NextOfKin {
  next_of_kin_id: number;
  farmer: number;
  name: string;
  relationship: string;
  phone_number: string;
  date_time_added: string;
}

export interface BankAccount {
  bank_account_id: number;
  farmer: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  date_time_added: string;
}

// ==================== INSURANCE TYPES ====================

export interface CoverType {
  cover_type_id: number;
  cover_type: string;
  description?: string;
  status: boolean;
  deleted: boolean;
  date_time_added: string;
}

export interface ProductCategory {
  product_category_id: number;
  cover_type: number;
  cover_type_name?: string;
  organisation: number;
  organisation_name?: string;
  product_category: string;
  description?: string;
  status: boolean;
  deleted: boolean;
  date_time_added: string;
}

export interface Season {
  season_id: number;
  organisation: number;
  organisation_name?: string;
  season: string;
  start_date?: string;
  end_date?: string;
  status: boolean;
  deleted: boolean;
  date_time_added: string;
}

export interface InsuranceProduct {
  product_id: number;
  organisation: number;
  organisation_name?: string;
  product_category: number;
  product_category_name?: string;
  season: number;
  season_name?: string;
  crop: number;
  crop_name?: string;
  crop_variety?: number;
  crop_variety_name?: string;
  product_name: string;
  average_premium_rate: number;
  sum_insured: number;
  status: string;
  date_time_added: string;
}

export interface Quotation {
  quotation_id: number;
  farmer: number;
  farmer_name?: string;
  farmer_first_name?: string;
  farmer_last_name?: string;
  farmer_id_number?: string;
  farm: number;
  farm_name?: string;
  insurance_product: number;
  product_name?: string;
  policy_number?: string;
  premium_amount: number;
  sum_insured: number;
  status: string;
  quotation_date: string;
  payment_date?: string;
  payment_reference?: string;
}

// ==================== CLAIM TYPES ====================

export interface LossAssessor {
  assessor_id: number;
  user: number;
  user_name?: string;
  organisation: number;
  organisation_name?: string;
  status: string;
  date_time_added: string;
}

export interface Claim {
  claim_id: number;
  farmer: number;
  farmer_name?: string;
  quotation: number;
  policy_number?: string;
  loss_assessor?: number;
  assessor_name?: string;
  claim_number: string;
  estimated_loss_amount: number;
  approved_amount?: number;
  status: string;
  claim_date: string;
  approval_date?: string;
  loss_details?: any;
}

export interface ClaimAssignment {
  assignment_id: number;
  claim: number;
  claim_number?: string;
  loss_assessor: number;
  assessor_name?: string;
  assigned_by: number;
  assignment_date: string;
}

// ==================== SUBSIDY & INVOICE TYPES ====================

export interface Subsidy {
  subsidy_id: number;
  organisation: number;
  organisation_name?: string;
  insurance_product: number;
  product_name?: string;
  subsidy_name: string;
  subsidy_rate: number;
  status: string;
  date_time_added: string;
}

export interface Invoice {
  invoice_id: number;
  organisation: number;
  organisation_name?: string;
  subsidy: number;
  subsidy_name?: string;
  invoice_number: string;
  amount: number;
  status: string;
  approved_date?: string;
  settlement_date?: string;
  payment_reference?: string;
  date_time_added: string;
}

// ==================== ADVISORY & WEATHER TYPES ====================

export interface Advisory {
  advisory_id: number;
  province?: string;
  district?: string;
  sector?: string;
  gender?: string;
  message: string;
  recipients_count: number;
  send_now: boolean;
  status: string;
  sent_date_time?: string;
  date_time_added: string;
}

export interface WeatherData {
  weather_id: number;
  location: string;
  data_type: 'HISTORICAL' | 'FORECAST';
  value: number;
  recorded_at: string;
  start_date?: string;
  end_date?: string;
  status: string;
  date_time_added: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  detail?: string;
  error?: string;
  errors?: any;
  [key: string]: any;
}

// ==================== FORM TYPES ====================

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh: string;
  user: User;
  expires_in: number;
}

export interface RegistrationData {
  user_email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_phone_number?: string;
  organisation_id?: number;
}

export class CropModel{
    id : number = 0;
    varietyName : string = '';
    select : string = '';
    status : string = '';
}
