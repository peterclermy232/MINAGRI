import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'api'; // in-memory API root

  constructor(private http: HttpClient) {}

  // 🚀 Fetch Users + Orgs + Countries together
  getUsers(): Observable<any> {
    return forkJoin({
      usersResponse: this.http.get<any>(`${this.apiUrl}/users`),
      orgsResponse: this.http.get<any>(`${this.apiUrl}/organisations`),
      countriesResponse: this.http.get<any>(`${this.apiUrl}/countries`)
    });
  }

  postUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data);
  }

  updateUser(data: any, id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
}
