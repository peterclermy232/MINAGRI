// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { ENV } from '../app/types';

export const environment: ENV = {
  production: false,
  consumer_key: 'hpHBZ6V_SxZUzeJX2VuwPnpLwb4a',
  consumer_secret: '6psbCCyfbTi3rrN0ybApNr4C2Wka',
  user_consumer_key: 'Eric',
  user_consumer_secret: 'w3lc0m3',
  // crop_baseurl: 'https://apim-minagri.wrightinteractives.com',
  crop_baseurl: 'https://crop-insurance-minagri.wrightinteractives.com',
  auth_baseurl:
    'http://localhost:3000/users',
  oauth_baseurl: 'http://localhost:3000/users',
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
