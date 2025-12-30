// src/environments/environment.ts
import { ENV } from '../app/types';

export const environment: ENV = {
  production: false,
  // Django API configuration
  apiUrl: 'https://web-production-39ac0.up.railway.app/api/v1',
  authUrl: 'https://web-production-39ac0.up.railway.app/api/v1/auth',
// 8000
  // Legacy fields (keep for compatibility)
  consumer_key: 'hpHBZ6V_SxZUzeJX2VuwPnpLwb4a',
  consumer_secret: '6psbCCyfbTi3rrN0ybApNr4C2Wka',
  user_consumer_key: 'Eric',
  user_consumer_secret: 'w3lc0m3',
  crop_baseurl: 'https://web-production-39ac0.up.railway.app/api/v1',
  auth_baseurl: 'https://web-production-39ac0.up.railway.app/api/v1',
  oauth_baseurl: 'https://web-production-39ac0.up.railway.app/api/v1',
};
