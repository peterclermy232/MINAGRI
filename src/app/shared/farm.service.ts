import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface Farm {
  farm_id?: number;
  farmer: number;
  farm_name: string;
  farm_size: string;
  unit_of_measure: string;
  location_province: string;
  location_district: string;
  location_sector: string;
  status: string;
  date_time_added?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private apiUrl = `${environment.apiUrl}/farms/`; 

  constructor(private http: HttpClient) {}

  /**
   * Get all farms with optional pagination and search
   */
  getFarms(page?: number, search?: string): Observable<PaginatedResponse<Farm>> {
    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Farm>>(this.apiUrl, { params });
  }

  /**
   * Get farms by farmer ID
   */
  getFarmsByFarmer(farmerId: number): Observable<PaginatedResponse<Farm>> {
    const params = new HttpParams().set('farmer_id', farmerId.toString());
    return this.http.get<PaginatedResponse<Farm>>(this.apiUrl, { params });
  }

  /**
   * Get a single farm by ID
   */
  getFarm(id: number): Observable<Farm> {
    return this.http.get<Farm>(`${this.apiUrl}${id}/`);
  }

  /**
   * Create a new farm
   */
  createFarm(farm: Partial<Farm>): Observable<Farm> {
    return this.http.post<Farm>(this.apiUrl, farm);
  }

  /**
   * Update an existing farm
   */
  updateFarm(id: number, farm: Partial<Farm>): Observable<Farm> {
    return this.http.put<Farm>(`${this.apiUrl}${id}/`, farm);
  }

  /**
   * Partial update of a farm
   */
  patchFarm(id: number, farm: Partial<Farm>): Observable<Farm> {
    return this.http.patch<Farm>(`${this.apiUrl}${id}/`, farm);
  }

  /**
   * Delete a farm
   */
  deleteFarm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
