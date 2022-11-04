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
