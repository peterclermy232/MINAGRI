export interface Crop {
  crop: string;
  cropId?: number;
  deleted: boolean;
  icon: string;
  organisationId: number;
  recordVersion?: number;
  status: boolean;
  
}

export interface CropVariety {
  cropVarietyId?: number;
  cropId: number;
  organisationId: number;
  recordVersion?: number;
  deleted: boolean;
  status: boolean;
  cropVariety: string;
}

export interface ENV {
  consumer_key: string;
  consumer_secret: string;
  production: boolean;
  oauth_baseurl: string;
  crop_baseurl: string;
  auth_baseurl: string;
  user_consumer_key: string;
  user_consumer_secret: string;
}

export interface ApiClientTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface CropResponse {
  cropId: number;
  organisationId: number;
  recordVersion: number;
  deleted: boolean;
  status: boolean;
  crop: string;
  icon: string;
}

export interface OrganizationType {
  organisation_type_id: number;
  organisation_type: string;
  organisation_type_status: string;
  record_version?: number;
}

export interface Organization {
  organisation_id?: number;
  country_id: number;
  organisation_type_id: number;
  organisation_code: string;
  organisation_name: string;
  organisation_email: string;
  organisation_msisdn: string;
  organisation_contact: string;
  organisation_status: string;
  record_version?: number;
}

export interface OrganizationTypeResponse {
  response_code: number;
  offset: number;
  results: {
    organisation_type_id: number;
    date_time_added: number;
    added_by: number;
    source_ip: string;
    date_time_modified: number;
    modified_by: string;
    latest_ip: string;
    organisation_type: string;
    organisation_type_status: string;
    record_version: 1;
    organisation_type_description: string;
  }[];
  page_size: number;
}

export interface organizationResponse {
  response_code: number;
  offset: number;
  results: OrganizationType[];
  page_size: number;
}

export interface ContriesResponse {
  response_code: number;
  offset: number;
  results: {
    country_id: number;
    date_time_added: number;
    added_by: number;
    source_ip: string;
    date_time_modified: number;
    modified_by: any;
    latest_ip: any;
    record_version: number;
    country_is_deleted: boolean;
    country: string;
    country_code: string;
  }[];
  page_size: number;
}

export interface Datatable {
  columns: {
    label: string;
    data: string;
    dynamic?: boolean;
    classes: string;
  }[];
}

export interface UsersResponse {
  response_code: 200;
  offset: 0;
  results: {
    user_id: number;
    date_time_added: number;
    added_by: number;
    source_ip: string;
    date_time_modified: number;
    modified_by: any;
    latest_ip: any;
    organisation_id: number;
    country_id: any;
    reports_to_id: any;
    user_type: string;
    user_name: string;
    user_first_name: any;
    user_middle_name: any;
    user_last_name: any;
    user_email: string;
    user_msisdn: string;
    user_password: string;
    failed_logins: number;
    locked_till_date_time: any;
    user_password_expires_date_time: any;
    reset_code: any;
    reset_password: number;
    otp_active: any;
    otp_secret: any;
    otp_counter: number;
    otp_length: number;
    user_status: string;
    record_version: number;
    organisation_type: string;
    organisation_code: string;
    organisation_name: string;
    failed_login_threshold: number;
    failed_login_backoff: number;
    organisation_status: string;
    branch_type: any;
    branch_code: any;
    branch_name: any;
    branch_status: any;
    user_roles: {
      user_role_id: number;
      record_version: number;
      user_role_status: string;
      user_id: number;
      role_id: number;
      role_type: string;
      role_name: string;
      role_description: string;
      role_status: string;
    }[];
  }[];
  page_size: 0;
}

export interface User {
  organisation_id: number;
  country_id: number;
  user_type: string;
  user_id?: number;
  user_name: string;
  user_email: string;
  user_msisdn: string;
  new_password: string;
  user_status: string;
  record_version?: number;
}

export interface CoverType {
  coverTypeId: number;
  organisationId: number;
  recordVersion?: number;
  deleted: boolean;
  status: boolean;
  coverType: string;
}

export interface ProductCategory {
  productCategoryId: number;
  coverTypeId: number;
  organisationId: number;
  recordVersion: number;
  deleted: boolean;
  status: boolean;
  productCategory: string;
  description: string;
}

export interface Season {
  deleted: boolean;
  description: string;
  organisationId: number;
  recordVersion: number;
  season: string;
  seasonEndDate: string;
  seasonId?: 2;
  seasonStartDate: string;
  status: boolean;
}

// organisation_id: number;
// date_time_added: number;
// added_by: any;
// source_ip: any;
// date_time_modified: number;
// modified_by: any;
// latest_ip: any;
// record_version: number;
// organisation_status: string;
// organisation_is_deleted: boolean;
// country_id: number;
// organisation_type_id: number;
// organisation_code: string;
// organisation_name: string;
// organisation_physical_address: any;
// organisation_address: any;
// organisation_email: string;
// organisation_msisdn: string;
// organisation_contact: string;
// failed_login_threshold: number;
// // failed_login_backoff: number;
