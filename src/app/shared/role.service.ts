
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { OrganizationService } from '../app/shared/organization.service';
import { of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoleResponse, RoleVariety } from '../components/badges/role-name';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(
    private http: HttpClient,
    private organizationsService: OrganizationService
  ) {}

  //role apis
  postRole(data: any) {
    return this.http.post<any>('/api/v1/roles', {
      ...data,
      request_type: 'roleApi',
    });
  }
  getRoles() {
    return this.http
      .get<RoleResponse[]>('/api/v1/roles?request_type=roleApi')
      .pipe(
        switchMap((rolesResponse) => {
          return this.organizationsService
            .getOrganizationsShallow()
            .pipe(map((orgsResponse) => ({ rolesResponse, orgsResponse })));
        }),
        tap(({ rolesResponse, orgsResponse }) => {
          console.log('orgs, roles', rolesResponse, orgsResponse);
          return of({
            rolesResponse,
            orgsResponse,
          });
        })
      );
  }

  getRolesShallow() {
    return this.http.get<RoleResponse[]>('/api/v1/roles?request_type=roleApi');
  }

  updateRole(data: any, id: number) {
    return this.http.put<any>('/api/v1/roles/' + id, {
      ...data,
      request_type: 'roleApi',
    });
  }

  //role variety apis
  postRoleVariety(data: any) {
    return this.http.post<any>('/api/v1/role_varieties', {
      ...data,
      request_type: 'roleApi',
    });
  }
  getRoleVarieties() {
    return this.http
      .get<RoleVariety[]>('/api/v1/role_varieties?request_type=roleApi')
      .pipe(
        switchMap((roleVarResponse) => {
          return this.organizationsService
            .getOrganizationsShallow()
            .pipe(map((orgsResponse) => ({ roleVarResponse, orgsResponse })));
        }),
        switchMap(({ roleVarResponse, orgsResponse }) => {
          return this.getRolesShallow().pipe(
            map((rolesResponse) => ({
              roleVarResponse,
              orgsResponse,
              rolesResponse,
            }))
          );
        }),
        tap(({ roleVarResponse, orgsResponse, rolesResponse }) => {
          console.log(
            'orgs, roles',
            roleVarResponse,
            orgsResponse,
            rolesResponse
          );
          return of({
            roleVarResponse,
            orgsResponse,
            rolesResponse,
          });
        })
      );
  }
  updateRoleVariety(data: any, id: number) {
    return this.http.put<any>('/api/v1/role_varieties/' + id, {
      ...data,
      request_type: 'roleApi',
    });
  }
}

