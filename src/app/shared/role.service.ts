import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  // Get users by role
  getUsersByRole(role: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/`)
      .pipe(
        map((res: any) => {
          const users = Array.isArray(res) ? res : res?.results || [];
          return users.filter((user: any) => user.user_role === role);
        }),
        catchError(this.handleError)
      );
  }

  // Update user role
  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${userId}/`, {
      user_role: role
    }).pipe(catchError(this.handleError));
  }

  // Get available roles
  getAvailableRoles(): Observable<string[]> {
    return new Observable(observer => {
      observer.next([
        'ADMIN',
        'USER',
        'ASSESSOR',
        'MANAGER',
        'API USER',
        'SUPERUSER'
      ]);
      observer.complete();
    });
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
