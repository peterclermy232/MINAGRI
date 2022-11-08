import { Injectable } from '@angular/core';
import { CropResponse, OrganizationTypeResponse } from '../../types';
import { HttpClient } from '@angular/common/http';
import { of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private http: HttpClient) {}

  //organization type apis
  postOrganizationType(data: any) {
    return this.http.post<any>('/api/v1/organisation_types', {
      ...data,
      request_type: 'authApi',
    });
  }
  getOrganizationTypes() {
    return this.http.get<OrganizationTypeResponse[]>(
      '/api/v1/organisation_types?all=true&request_type=authApi'
    );
  }
  updateOrganizationType(data: any, id: number) {
    return this.http.put<any>('/api/v1/organisation_types/' + id, {
      ...data,
      request_type: 'authApi',
    });
  }

  //organization type apis
  postOrganization(data: any) {
    return this.http.post<any>('/api/v1/organisations', {
      ...data,
      request_type: 'authApi',
    });
  }
  getOrganizations() {
    return this.http
      .get<OrganizationTypeResponse[]>(
        '/api/v1/organisations?all=true&request_type=authApi'
      )
      .pipe(
        switchMap((orgsResponse) => {
          return this.getOrganizationTypes().pipe(
            map((orgTypesResponse) => ({ orgsResponse, orgTypesResponse }))
          );
        }),
        switchMap((orgsandTypes) => {
          return this.getCountries().pipe(
            map((countriesResponse) => ({
              orgsResponse: orgsandTypes.orgsResponse,
              orgTypesResponse: orgsandTypes.orgTypesResponse,
              countriesResponse,
            }))
          );
        }),
        tap(({ orgsResponse, orgTypesResponse, countriesResponse }) => {
          console.log(
            'orgs and types',
            orgsResponse,
            orgTypesResponse,
            countriesResponse
          );
          return of({
            orgTypesResponse,
            orgsResponse,
            countriesResponse,
          });
        })
      );
  }

  getOrganizationsShallow() {
    return this.http.get<OrganizationTypeResponse[]>(
      '/api/v1/organisations?all=true&request_type=authApi'
    );
  }

  updateOrganization(data: any, id: number) {
    return this.http.put<any>('/api/v1/organisations/' + id, {
      ...data,
      request_type: 'authApi',
    });
  }

  getCountries() {
    return this.http.get<any>(
      '/api/v1/countries?all=true&request_type=authApi'
    );
  }
}
