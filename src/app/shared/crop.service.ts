import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { OrganizationService } from './organization.service';

@Injectable({
  providedIn: 'root',
})
export class CropService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private organizationsService: OrganizationService
  ) {}

  /**
   * Get all crops with their organizations
   */
  getCrops(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/crops/`).pipe(
      switchMap((cropsResponse) => {
        return this.organizationsService
          .getOrganizationsShallow()
          .pipe(map((orgsResponse) => ({ cropsResponse, orgsResponse })));
      }),
      tap(({ cropsResponse, orgsResponse }) => {
        console.log('Crops and Orgs loaded:', {
          crops: Array.isArray(cropsResponse) ? cropsResponse.length : 0,
          orgs: orgsResponse
        });
        return of({ cropsResponse, orgsResponse });
      }),
      catchError((error) => {
        console.error('Error fetching crops:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new crop
   */
  postCrop(payload: any): Observable<any> {
  console.log('Sending crop payload:', payload);
  return this.http.post<any>(`${this.baseUrl}/crops/`, payload).pipe(
    tap((res) => console.log('Crop created:', res)),
    catchError((err) => throwError(() => err))
  );
}

updateCrop(payload: any, id: number): Observable<any> {
  console.log('Updating crop with payload:', payload);
  return this.http.put<any>(`${this.baseUrl}/crops/${id}/`, payload).pipe(
    tap((res) => console.log('Crop updated:', res)),
    catchError((err) => throwError(() => err))
  );
}


  /**
   * Delete a crop
   */
  deleteCrop(id: number): Observable<any> {
    console.log('Deleting crop:', id);

    return this.http.delete<any>(`${this.baseUrl}/crops/${id}/`).pipe(
      tap((response) => {
        console.log('Crop deleted successfully:', response);
      }),
      catchError((error) => {
        console.error('Error deleting crop:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get crops without organization data (shallow)
   */
  getCropsShallow(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/crops/?request_type=cropApi`).pipe(
      map((response) => {
        return Array.isArray(response) ? response : response.results || response;
      }),
      catchError((error) => {
        console.error('Error fetching crops shallow:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single crop by ID
   */
  getCropById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/crops/${id}/`).pipe(
      tap((response) => {
        console.log('Crop details:', response);
      }),
      catchError((error) => {
        console.error('Error fetching crop:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search crops by name
   */
  searchCrops(searchTerm: string): Observable<any> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http.get<any>(`${this.baseUrl}/crops/`, { params }).pipe(
      map((response) => {
        return Array.isArray(response) ? response : response.results || response;
      }),
      catchError((error) => {
        console.error('Error searching crops:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get active crops only
   */
  getActiveCrops(): Observable<any> {
    let params = new HttpParams().set('status', 'true');

    return this.http.get<any>(`${this.baseUrl}/crops/`, { params }).pipe(
      map((response) => {
        return Array.isArray(response) ? response : response.results || response;
      }),
      catchError((error) => {
        console.error('Error fetching active crops:', error);
        return throwError(() => error);
      })
    );
  }

  // ========== CROP VARIETY METHODS ==========

  /**
   * Get all crop varieties
   */
  getCropVarieties(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/crop_varieties/?request_type=cropApi`).pipe(
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
        console.log('Crop varieties loaded:', {
          varieties: Array.isArray(cropVarResponse) ? cropVarResponse.length : 0,
          orgs: orgsResponse,
          crops: Array.isArray(cropsResponse) ? cropsResponse.length : 0
        });
        return of({ cropVarResponse, orgsResponse, cropsResponse });
      }),
      catchError((error) => {
        console.error('Error fetching crop varieties:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new crop variety
   */
  postCropVariety(data: any): Observable<any> {
    const payload = {
      crop_variety: data.cropVariety || data.crop_variety,
      cropId: data.cropId || data.crop,
      organisationId: data.organisationId || 1,
      status: data.status,
      deleted: false,
      request_type: 'cropApi'
    };

    console.log('Creating crop variety with payload:', payload);

    return this.http.post<any>(`${this.baseUrl}/crop_varieties/`, payload).pipe(
      tap((response) => {
        console.log('Crop variety created successfully:', response);
      }),
      catchError((error) => {
        console.error('Error creating crop variety:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing crop variety
   */
  updateCropVariety(data: any, id: number): Observable<any> {
    const payload = {
      crop_variety: data.cropVariety || data.crop_variety,
      cropId: data.cropId || data.crop,
      organisationId: data.organisationId || 1,
      status: data.status,
      deleted: false,
      recordVersion: data.recordVersion || 1,
      request_type: 'cropApi'
    };

    console.log('Updating crop variety:', id, payload);

    return this.http.put<any>(`${this.baseUrl}/crop_varieties/${id}/`, payload).pipe(
      tap((response) => {
        console.log('Crop variety updated successfully:', response);
      }),
      catchError((error) => {
        console.error('Error updating crop variety:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a crop variety
   */
  deleteCropVariety(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/crop_varieties/${id}/`).pipe(
      tap((response) => {
        console.log('Crop variety deleted successfully:', response);
      }),
      catchError((error) => {
        console.error('Error deleting crop variety:', error);
        return throwError(() => error);
      })
    );
  }
}
