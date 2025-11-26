// in-memory-data.service.ts
import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {

  constructor() {
    console.log('InMemoryDataService constructed');
  }

  createDb() {
    console.log('=== CREATING IN-MEMORY DATABASE ===');

    const users = [
      {
        user_id: 1,
        organisation_id: 1,
        country_id: 1,
        user_type: 'API USER',
        user_name: 'John Doe',
        user_email: 'john.doe@safeguard.co.ke',
        user_msisdn: '+254711111111',
        user_status: 'ACTIVE',
        record_version: 1,
        date_time_added: Date.now(),
      },
      {
        user_id: 2,
        organisation_id: 1,
        country_id: 1,
        user_type: 'API USER',
        user_name: 'Jane Smith',
        user_email: 'jane.smith@safeguard.co.ke',
        user_msisdn: '+254722222222',
        user_status: 'ACTIVE',
        record_version: 1,
        date_time_added: Date.now(),
      },
      {
        user_id: 3,
        organisation_id: 2,
        country_id: 1,
        user_type: 'API USER',
        user_name: 'Peter Mwangi',
        user_email: 'peter.mwangi@farmersunited.co.ke',
        user_msisdn: '+254733333333',
        user_status: 'ACTIVE',
        record_version: 1,
        date_time_added: Date.now(),
      },
      {
        user_id: 4,
        organisation_id: 3,
        country_id: 2,
        user_type: 'API USER',
        user_name: 'Sarah Nakato',
        user_email: 'sarah.nakato@ugandashield.ug',
        user_msisdn: '+256711111111',
        user_status: 'ACTIVE',
        record_version: 1,
        date_time_added: Date.now(),
      },
      {
        user_id: 5,
        organisation_id: 4,
        country_id: 3,
        user_type: 'API USER',
        user_name: 'James Kileo',
        user_email: 'james.kileo@agric.go.tz',
        user_msisdn: '+255711111111',
        user_status: 'INACTIVE',
        record_version: 1,
        date_time_added: Date.now(),
      },
    ];

    const organisations = [
      {
        organisation_id: 1,
        country_id: 1,
        organisation_type_id: 1,
        organisation_code: 'INS001',
        organisation_name: 'SafeGuard Insurance Ltd',
        organisation_email: 'info@safeguard.co.ke',
        organisation_msisdn: '+254712345678',
        organisation_contact: 'John Kamau',
        organisation_status: 'ACTIVE',
        record_version: 1,
      },
      {
        organisation_id: 2,
        country_id: 1,
        organisation_type_id: 2,
        organisation_code: 'COOP001',
        organisation_name: 'Farmers United Cooperative',
        organisation_email: 'info@farmersunited.co.ke',
        organisation_msisdn: '+254723456789',
        organisation_contact: 'Mary Wanjiku',
        organisation_status: 'ACTIVE',
        record_version: 1,
      },
      {
        organisation_id: 3,
        country_id: 2,
        organisation_type_id: 1,
        organisation_code: 'INS002',
        organisation_name: 'Uganda Shield Insurance',
        organisation_email: 'contact@ugandashield.ug',
        organisation_msisdn: '+256701234567',
        organisation_contact: 'David Okello',
        organisation_status: 'ACTIVE',
        record_version: 1,
      },
      {
        organisation_id: 4,
        country_id: 3,
        organisation_type_id: 3,
        organisation_code: 'GOV001',
        organisation_name: 'Tanzania Agricultural Ministry',
        organisation_email: 'info@agric.go.tz',
        organisation_msisdn: '+255612345678',
        organisation_contact: 'Hassan Mbogo',
        organisation_status: 'ACTIVE',
        record_version: 1,
      },
      {
        organisation_id: 5,
        country_id: 4,
        organisation_type_id: 4,
        organisation_code: 'NGO001',
        organisation_name: 'Rwanda Rural Development NGO',
        organisation_email: 'info@rrdn.rw',
        organisation_msisdn: '+250788123456',
        organisation_contact: 'Grace Uwase',
        organisation_status: 'ACTIVE',
        record_version: 1,
      },
    ];

    const organisation_types = [
      {
        organisation_type_id: 1,
        organisation_type: 'Insurance Company',
        organisation_type_status: 'ACTIVE',
        record_version: 1,
        organisation_type_description: 'Insurance provider organizations',
      },
      {
        organisation_type_id: 2,
        organisation_type: 'Agricultural Cooperative',
        organisation_type_status: 'ACTIVE',
        record_version: 1,
        organisation_type_description: 'Farmer cooperative organizations',
      },
      {
        organisation_type_id: 3,
        organisation_type: 'Government Agency',
        organisation_type_status: 'ACTIVE',
        record_version: 1,
        organisation_type_description: 'Government departments and agencies',
      },
      {
        organisation_type_id: 4,
        organisation_type: 'NGO',
        organisation_type_status: 'ACTIVE',
        record_version: 1,
        organisation_type_description: 'Non-governmental organizations',
      },
    ];

    const countries = [
      {
        country_id: 1,
        country: 'Kenya',
        country_code: 'KE',
        record_version: 1,
        country_is_deleted: false,
      },
      {
        country_id: 2,
        country: 'Uganda',
        country_code: 'UG',
        record_version: 1,
        country_is_deleted: false,
      },
      {
        country_id: 3,
        country: 'Tanzania',
        country_code: 'TZ',
        record_version: 1,
        country_is_deleted: false,
      },
      {
        country_id: 4,
        country: 'Rwanda',
        country_code: 'RW',
        record_version: 1,
        country_is_deleted: false,
      },
    ];

    console.log('Created users:', users.length);
    console.log('Created organisations:', organisations.length);
    console.log('Created organisation_types:', organisation_types.length);
    console.log('Created countries:', countries.length);

    const db = { users, organisations, organisation_types, countries };
    console.log('Full database:', db);

    return db;
  }

  // Generate IDs for new items
  genId<T extends { [key: string]: any }>(
    collection: T[],
    collectionName: string
  ): number {
    console.log(`genId called for ${collectionName}, collection length: ${collection.length}`);

    if (collectionName === 'users') {
      return collection.length > 0
        ? Math.max(...collection.map((item) => item['user_id'])) + 1
        : 1;
    }
    if (collectionName === 'organisations') {
      return collection.length > 0
        ? Math.max(...collection.map((item) => item['organisation_id'])) + 1
        : 1;
    }
    if (collectionName === 'organisation_types') {
      return collection.length > 0
        ? Math.max(...collection.map((item) => item['organisation_type_id'])) + 1
        : 1;
    }
    if (collectionName === 'countries') {
      return collection.length > 0
        ? Math.max(...collection.map((item) => item['country_id'])) + 1
        : 1;
    }
    return 1;
  }

  // Optional: Add custom response interceptor
  responseInterceptor(res: any, ri: RequestInfo) {
    console.log('Response interceptor:', ri.method, ri.url, res);
    return res;
  }

  parseRequestUrl(url: string, utils: any) {
  console.log('Parsing URL:', url);

  const parsed = utils.parseRequestUrl(url);
  const segments = url.split('/');
  const apiIndex = segments.indexOf('v1');

  if (apiIndex !== -1 && segments[apiIndex + 1]) {
  parsed.collectionName = segments[apiIndex + 1].split('?')[0];
  console.log('Extracted collection name:', parsed.collectionName);
}

  return parsed;
}

}
