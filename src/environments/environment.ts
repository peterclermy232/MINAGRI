// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { ENV } from '../app/types';

export const environment: ENV = {
  production: false,
  consumer_key: 'phaIRZmh7WjBIae1VxcL_zMcjlca',
  consumer_secret: 'FyoQGDIrMeNY0VERT4isrjI5Bq0a',
  crop_baseurl:
    'https://apim-minagri.wrightinteractives.com:8243/crop-insurance/1.0',
  oauth_baseurl: 'https://apim-minagri.wrightinteractives.com:9443',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
