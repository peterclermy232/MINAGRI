import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationTypeResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private http: HttpClient) {}

  //organization type apis
  postOrganizationType(data: any) {
    return this.http.post<any>('/api/v1/organisation_types', data);
  }

  getOrganizationTypes() {
    return this.http.get<OrganizationTypeResponse[]>(
      '/api/v1/organisation_types?all=true'
    );
  }

  updateOrganizationType(data: any, id: number) {
    return this.http.put<any>('/api/v1/organisation_types/' + id, data);
  }

  //organization APIs
  postOrganization(data: any) {
    return this.http.post<any>('/api/v1/organisations', data);
  }

  getOrganizations() {
    return this.http
      .get<OrganizationTypeResponse[]>(
        '/api/v1/organisations?all=true'
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
    console.log('OrganizationService.getOrganizationsShallow() called');
    return this.http.get<OrganizationTypeResponse[]>(
      '/api/v1/organisations?all=true'
    ).pipe(
      tap((response) => {
        console.log('getOrganizationsShallow response:', response);
      })
    );
  }

  updateOrganization(data: any, id: number) {
    return this.http.put<any>('/api/v1/organisations/' + id, data);
  }

  getCountries() {
    console.log('OrganizationService.getCountries() called');
    return this.http.get<any>(
      '/api/v1/countries?all=true'
    ).pipe(
      tap((response) => {
        console.log('getCountries response:', response);
      })
    );
  }
}
