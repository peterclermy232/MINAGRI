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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
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

  // ==================== CROP VARIETIES ====================

  /**
   * Get all crop varieties
   */
  getCropVarieties(): Observable<any> {
    return this.http.get(`${this.baseUrl}/crop_varieties/`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get crop varieties with related details (crops and organizations)
   */
  getCropVarietiesWithDetails(): Observable<any> {
    return this.http.get(`${this.baseUrl}/crop_varieties/with_details/`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get single crop variety by ID
   */
  getCropVariety(varietyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/crop_varieties/${varietyId}/`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Create a new crop variety
   * Expected payload structure:
   * {
   *   crop: number (foreign key to Crop),
   *   organisation: number (foreign key to Organisation),
   *   crop_variety: string,
   *   status: boolean,
   *   deleted: boolean
   * }
   */
  postCropVariety(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/crop_varieties/`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Update an existing crop variety
   * Expected payload structure:
   * {
   *   crop: number,
   *   organisation: number,
   *   crop_variety: string,
   *   status: boolean,
   *   deleted: boolean,
   *   record_version: number (for optimistic locking)
   * }
   */
  updateCropVariety(varietyId: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/crop_varieties/${varietyId}/`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Partially update a crop variety
   */
  patchCropVariety(varietyId: number, payload: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/crop_varieties/${varietyId}/`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Delete a crop variety (soft delete by setting deleted=true)
   */
  deleteCropVariety(varietyId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/crop_varieties/${varietyId}/`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get crop varieties by crop ID
   */
  getCropVarietiesByCrop(cropId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/crop_varieties/?crop=${cropId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get crop varieties by organization ID
   */
  getCropVarietiesByOrganisation(orgId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/crop_varieties/?organisation=${orgId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get active crop varieties only
   */
  getActiveCropVarieties(): Observable<any> {
    return this.http.get(`${this.baseUrl}/crop_varieties/?status=true`, {
      headers: this.getHeaders()
    });
  }
}
