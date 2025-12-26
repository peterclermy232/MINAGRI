import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RoleType {
  role_id?: number;
  organisation: number;
  role_name: string;
  role_description?: string;
  role_status: string;
  permissions?: any;
  is_system_role?: boolean;
  organisation_name?: string;
  user_count?: number;
  date_time_added?: string;
  date_time_modified?: string;
}

export interface RoleResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RoleType[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  // Get all roles with optional filters
  getAllRoles(params?: {
    organisation_id?: number;
    status?: string;
    search?: string;
  }): Observable<RoleResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.organisation_id) {
        httpParams = httpParams.set('organisation_id', params.organisation_id.toString());
      }
      if (params.status) {
        httpParams = httpParams.set('status', params.status);
      }
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
    }

    return this.http.get<RoleResponse>(this.apiUrl + '/', { params: httpParams });
  }

  // Get available role names for dropdown
  getAvailableRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/available_roles/`);
  }

  // Get single role by ID
  getRoleById(roleId: number): Observable<RoleType> {
    return this.http.get<RoleType>(`${this.apiUrl}/${roleId}/`);
  }

  // Create new role
  createRole(roleData: Partial<RoleType>): Observable<RoleType> {
    return this.http.post<RoleType>(this.apiUrl + '/', roleData);
  }

  // Update existing role
  updateRole(roleId: number, roleData: Partial<RoleType>): Observable<RoleType> {
    return this.http.patch<RoleType>(`${this.apiUrl}/${roleId}/`, roleData);
  }

  // Delete role
  deleteRole(roleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${roleId}/`);
  }

  // Get users assigned to a role
  getRoleUsers(roleId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${roleId}/users/`);
  }

  // Get role statistics
  getRoleStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/`);
  }

  // Activate role
  activateRole(roleId: number): Observable<RoleType> {
    return this.http.post<RoleType>(`${this.apiUrl}/${roleId}/activate/`, {});
  }

  // Deactivate role
  deactivateRole(roleId: number): Observable<RoleType> {
    return this.http.post<RoleType>(`${this.apiUrl}/${roleId}/deactivate/`, {});
  }

  // Get all users (for user-role assignment)
  getAllUsers(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/`);
  }

  // Update user's role
  updateUserRole(userId: number, payload: any): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/users/${userId}/`, payload);
  }
}
