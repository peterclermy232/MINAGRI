import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CropResponse, CropVariety } from '../types';
import { of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationService } from './organization.service';

@Injectable({
  providedIn: 'root',
})
export class CropService {
  constructor(
    private http: HttpClient,
    private organizationsService: OrganizationService
  ) {}

  //crop apis
  postCrop(data: any) {
    return this.http.post<any>('/api/v1/crops', {
      ...data,
      request_type: 'cropApi',
    });
  }
  getCrops() {
    return this.http
      .get<CropResponse[]>('/api/v1/crops?request_type=cropApi')
      .pipe(
        switchMap((cropsResponse) => {
          return this.organizationsService
            .getOrganizationsShallow()
            .pipe(map((orgsResponse) => ({ cropsResponse, orgsResponse })));
        }),
        tap(({ cropsResponse, orgsResponse }) => {
          console.log('orgs, crops', cropsResponse, orgsResponse);
          return of({
            cropsResponse,
            orgsResponse,
          });
        })
      );
  }

  getCropsShallow() {
    return this.http.get<CropResponse[]>('/api/v1/crops?request_type=cropApi');
  }

  updateCrop(data: any, id: number) {
    return this.http.put<any>('/api/v1/crops/' + id, {
      ...data,
      request_type: 'cropApi',
    });
  }

  //crop variety apis
  postCropVariety(data: any) {
    return this.http.post<any>('/api/v1/crop_varieties', {
      ...data,
      request_type: 'cropApi',
    });
  }
  getCropVarieties() {
    return this.http
      .get<CropVariety[]>('/api/v1/crop_varieties?request_type=cropApi')
      .pipe(
        switchMap((cropVarResponse) => {
          return this.organizationsService
            .getOrganizationsShallow()
            .pipe(map((orgsResponse) => ({ cropVarResponse, orgsResponse })));
        }),
        switchMap(({ cropVarResponse, orgsResponse }) => {
          return this.getCropsShallow().pipe(
            map((cropsResponse) => ({
              cropVarResponse,
              orgsResponse,
              cropsResponse,
            }))
          );
        }),
        tap(({ cropVarResponse, orgsResponse, cropsResponse }) => {
          console.log(
            'orgs, crops',
            cropVarResponse,
            orgsResponse,
            cropsResponse
          );
          return of({
            cropVarResponse,
            orgsResponse,
            cropsResponse,
          });
        })
      );
  }
  updateCropVariety(data: any, id: number) {
    return this.http.put<any>('/api/v1/crop_varieties/' + id, {
      ...data,
      request_type: 'cropApi',
    });
  }
}
