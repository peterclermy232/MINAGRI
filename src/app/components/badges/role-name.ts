export class RoleModel{
    id : number = 0;
    name : string = '';
    description : string = '';
    select : string = ''

}

export interface Role{
    Role: string;
    roleId?: number;
     name: string;
   description: string;
    organisationId: number;
    recordVersion?: number;
    status: boolean;
    
    
}


  export interface ENV {
    consumer_key: string;
    consumer_secret: string;
    production: boolean;
    oauth_baseurl: string;
    role_baseurl:string
    crop_baseurl: string;
    auth_baseurl: string;
    user_consumer_key: string;
    user_consumer_secret: string;
  }
  
  export interface ApiClientTokenResponse {
    access_token: string;
    expires_in: number;
  }
  
  export interface RoleResponse {
    roleId: number;
    organisationId: number;
    recordVersion: number;
    status: boolean;
    description: string;
    name: string;
  }

  export interface RoleVariety {
    roleVarietyId?: number;
    roleId: number;
    organisationId: number;
    recordVersion?: number;
    name: string;
    status: boolean;
    description: string;
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