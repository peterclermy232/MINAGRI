import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationTypeResponse } from '../types';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private organisationTypeUrl = `${environment.apiUrl}/organisation_types`;
  private organisationUrl = `${environment.apiUrl}/organisations`;
  private countryUrl = `${environment.apiUrl}/countries`;
  constructor(private http: HttpClient) {}

  //organization type apis
  postOrganizationType(data: any) {
    return this.http.post<any>(`${this.organisationTypeUrl}/`, data);
  }

  getOrganizationTypes() {
    return this.http.get<OrganizationTypeResponse[]>(
      `${this.organisationTypeUrl}/`
    );
  }

  updateOrganizationType(data: any, id: number) {
    return this.http.put<any>(`${this.organisationTypeUrl}/` + id, data);
  }

  //organization APIs
  postOrganization(data: any) {
    return this.http.post<any>(`${this.organisationUrl}/`, data);
  }

  getOrganizations() {
    return this.http
      .get<OrganizationTypeResponse[]>(
        `${this.organisationUrl}/`
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
      `${this.organisationUrl}/`
    ).pipe(
      tap((response) => {
        console.log('getOrganizationsShallow response:', response);
      })
    );
  }

  updateOrganization(data: any, id: number) {
    return this.http.put<any>(`${this.organisationUrl}/` + id + '/', data);
  }

  getCountries() {
    console.log('OrganizationService.getCountries() called');
    return this.http.get<any>(
      `${this.countryUrl}/`
    ).pipe(
      tap((response) => {
        console.log('getCountries response:', response);
      })
    );
  }
}
