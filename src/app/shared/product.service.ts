import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CropResponse } from '../types';
import { of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationService } from './organization.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(
    private http: HttpClient,
    private organisationService: OrganizationService
  ) {}
 private baseUrl = `${environment.apiUrl}/product_categories/`;
 private seasonUrl = `${environment.apiUrl}/seasons`;
 private coverUrl = `${environment.apiUrl}/cover_types`;
  //product category apis
  postProductCategory(data: any) {
    return this.http.post<any>(`${this.baseUrl}`, {
      ...data,
      request_type: 'cropApi',
    });
  }

  getProductCategories() {
    return this.http
      .get<any>(`${this.baseUrl}?request_type=cropApi`)
      .pipe(
        switchMap((productCategoryResponse) => {
          return this.getCoverTypes().pipe(
            map((coverTypesResponse) => ({
              productCategoryResponse,
              coverTypesResponse,
            }))
          );
        }),
        switchMap(({ productCategoryResponse, coverTypesResponse }) => {
          return this.organisationService.getOrganizationsShallow().pipe(
            map((organisationsResponse) => ({
              productCategoryResponse,
              coverTypesResponse,
              organisationsResponse,
            }))
          );
        }),
        tap(
          ({
            productCategoryResponse,
            coverTypesResponse,
            organisationsResponse,
          }) => {
            console.log(
              'orgs, crops',
              productCategoryResponse,
              coverTypesResponse,
              organisationsResponse
            );
            return of({
              productCategoryResponse,
              coverTypesResponse,
              organisationsResponse,
            });
          }
        )
      );
  }

  updateProductCategory(data: any, index: number) {
    return this.http.put<any>(`${this.baseUrl}/${index}/`, {
      ...data,
      request_type: 'cropApi',
    });
  }

  getCoverTypes() {
    return this.http.get<any>(`${this.coverUrl}?request_type=cropApi`);
  }

  //season apis
  postSeason(data: any) {
    return this.http.post<any>(`${this.seasonUrl}`, {
      ...data,
      request_type: 'cropApi',
    });
  }

  getSeasons() {
    return this.http.get<any>(`${this.seasonUrl}?request_type=cropApi`).pipe(
      switchMap((seasonsResponse) => {
        return this.organisationService.getOrganizationsShallow().pipe(
          map((organisationsResponse) => ({
            seasonsResponse,
            organisationsResponse,
          }))
        );
      }),
      tap(({ seasonsResponse, organisationsResponse }) => {
        console.log('seasons, orgs', seasonsResponse, organisationsResponse);
        return of({
          seasonsResponse,
          organisationsResponse,
        });
      })
    );
  }

  updateSeason(data: any, index: number) {
    return this.http.put<any>(`${this.seasonUrl}/${index}`, {
      ...data,
      request_type: 'cropApi',
    });
  }
}
