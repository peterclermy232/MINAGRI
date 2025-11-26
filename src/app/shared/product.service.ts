import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CropResponse } from '../types';
import { of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationService } from './organization.service';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(
    private http: HttpClient,
    private organisationService: OrganizationService
  ) {}

  //product category apis
  postProductCategory(data: any) {
    return this.http.post<any>('/api/v1/product_categories', {
      ...data,
      request_type: 'cropApi',
    });
  }

  getProductCategories() {
    return this.http
      .get<any>('/api/v1/product_categories?request_type=cropApi')
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
    return this.http.put<any>('/api/v1/product_categories/' + index, {
      ...data,
      request_type: 'cropApi',
    });
  }

  getCoverTypes() {
    return this.http.get<any>('/api/v1/cover_types?request_type=cropApi');
  }

  //season apis
  postSeason(data: any) {
    return this.http.post<any>('/api/v1/seasons', {
      ...data,
      request_type: 'cropApi',
    });
  }

  getSeasons() {
    return this.http.get<any>('/api/v1/seasons?request_type=cropApi').pipe(
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
    return this.http.put<any>('/api/v1/seasons/' + index, {
      ...data,
      request_type: 'cropApi',
    });
  }
}
