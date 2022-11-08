import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { UsersResponse } from '../types';
import { of, switchMap, tap } from 'rxjs';
import { OrganizationService } from '../app/shared/organization.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private organizationsService: OrganizationService
  ) {}

  postUser(data: any) {
    return this.http
      .post<any>('/api/v1/users', {
        ...data,
        request_type: 'authApi',
      })
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }
  getUsers() {
    return this.http
      .get<UsersResponse>('/api/v1/users?all=true&request_type=authApi')
      .pipe(
        switchMap((usersResponse) => {
          return this.organizationsService
            .getOrganizationsShallow()
            .pipe(map((orgsResponse) => ({ usersResponse, orgsResponse })));
        }),
        switchMap((usersandOrgs) => {
          return this.organizationsService.getCountries().pipe(
            map((countriesResponse) => ({
              orgsResponse: usersandOrgs.orgsResponse,
              usersResponse: usersandOrgs.usersResponse,
              countriesResponse,
            }))
          );
        }),
        tap(({ orgsResponse, usersResponse, countriesResponse }) => {
          console.log(
            'orgs, users, countries',
            orgsResponse,
            usersResponse,
            countriesResponse
          );
          return of({
            usersResponse,
            orgsResponse,
            countriesResponse,
          });
        })
      );
  }
  updateUser(data: any, id: number) {
    return this.http
      .put<any>('/api/v1/users/' + id, {
        ...data,
        request_type: 'authApi',
      })
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }
}
