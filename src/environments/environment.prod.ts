import { ENV } from '../app/types';

export const environment: ENV = {
  // Django API configuration
  apiUrl: 'http://127.0.0.1:8001/api/v1',
  authUrl: 'http://127.0.0.1:8001/api/v1/auth',

  production: true,
  consumer_key: 'hpHBZ6V_SxZUzeJX2VuwPnpLwb4a',
  consumer_secret: '6psbCCyfbTi3rrN0ybApNr4C2Wka',
  user_consumer_key: 'Eric',
  user_consumer_secret: 'w3lc0m3',
  // crop_baseurl: 'https://apim-minagri.wrightinteractives.com',
  crop_baseurl: 'https://crop-insurance-minagri.wrightinteractives.com',
  auth_baseurl:
    'https://apim-minagri.wrightinteractives.com/authentication/1.0.0',
  oauth_baseurl: 'https://apim-minagri.wrightinteractives.com',
};
