// src/environments/environment.ts
import { ENV } from '../app/types';

export const environment: ENV = {
  production: false,
  // Django API configuration
  apiUrl: 'http://localhost:8001/api/v1',
  authUrl: 'http://localhost:8001/api/v1/auth',
// 8000
  // Legacy fields (keep for compatibility)
  consumer_key: 'hpHBZ6V_SxZUzeJX2VuwPnpLwb4a',
  consumer_secret: '6psbCCyfbTi3rrN0ybApNr4C2Wka',
  user_consumer_key: 'Eric',
  user_consumer_secret: 'w3lc0m3',
  crop_baseurl: 'http://localhost:8001/api/v1',
  auth_baseurl: 'http://localhost:8001/api/v1',
  oauth_baseurl: 'http://localhost:8001/api/v1',
};
