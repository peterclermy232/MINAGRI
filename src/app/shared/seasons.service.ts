import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SeasonModel } from '../seasons/season';


@Injectable({
  providedIn: 'root'
})
export class SeasonsService {
  private baseUrl = `${environment.apiUrl}/seasons`;
  private organisationUrl = `${environment.apiUrl}/organisations`;

  constructor(private http: HttpClient) { }

  /**
   * Get all seasons
   */
  getSeasons(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/`)
      .pipe(
        map((res: any) => {
          if (Array.isArray(res)) {
            return res;
          } else if (res && Array.isArray(res.results)) {
            return res.results;
          } else if (res && res.data && Array.isArray(res.data)) {
            return res.data;
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get seasons with organisations (for dropdowns)
   */
  getSeasonsWithDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/`)
      .pipe(
        map((seasonsResponse: any) => {
          const seasons = Array.isArray(seasonsResponse)
            ? seasonsResponse
            : seasonsResponse?.results || [];

          return this.getOrganisations().pipe(
            map((organisationsResponse: any) => {
              const organisations = Array.isArray(organisationsResponse)
                ? organisationsResponse
                : organisationsResponse?.results || [];

              return {
                seasonsResponse: seasons,
                organisationsResponse: organisations
              };
            })
          );
        }),
        // Flatten the nested observable
        map((obs: Observable<any>) => obs),
        catchError(this.handleError)
      );
  }

  /**
   * Get single season by ID
   */
  getSeason(id: number): Observable<SeasonModel> {
    return this.http.get<SeasonModel>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get active seasons only
   */
  getActiveSeasons(): Observable<any[]> {
    return this.getSeasons().pipe(
      map((seasons: any[]) => seasons.filter(s => s.status === true && s.deleted === false))
    );
  }

  /**
   * Get seasons by organisation
   */
  getSeasonsByOrganisation(organisationId: number): Observable<any[]> {
    return this.getSeasons().pipe(
      map((seasons: any[]) => seasons.filter(s => s.organisation === organisationId))
    );
  }

  /**
   * Create new season
   */
  postSeasons(data: SeasonModel): Observable<SeasonModel> {
    return this.http.post<SeasonModel>(`${this.baseUrl}/`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update existing season
   */
  updateSeasons(data: SeasonModel, id: number): Observable<SeasonModel> {
    return this.http.put<SeasonModel>(`${this.baseUrl}/${id}/`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete season (soft delete - sets deleted=true)
   */
  deleteSeason(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}/`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Soft delete season (update deleted flag)
   */
  softDeleteSeason(id: number): Observable<SeasonModel> {
    return this.http.put<SeasonModel>(`${this.baseUrl}/${id}/`, { deleted: true })
      .pipe(catchError(this.handleError));
  }

  /**
   * Activate/Deactivate season
   */
  toggleSeasonStatus(id: number, status: boolean): Observable<SeasonModel> {
    return this.http.put<SeasonModel>(`${this.baseUrl}/${id}/`, { status: status })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get current active season (based on date)
   */
  getCurrentSeason(): Observable<SeasonModel | null> {
    const today = new Date().toISOString().split('T')[0];

    return this.getActiveSeasons().pipe(
      map((seasons: any[]) => {
        const currentSeason = seasons.find(s => {
          if (s.start_date && s.end_date) {
            return s.start_date <= today && s.end_date >= today;
          }
          return false;
        });
        return currentSeason || null;
      })
    );
  }

  /**
   * Get organisations for dropdown
   */
  private getOrganisations(): Observable<any[]> {
    return this.http.get<any>(`${this.organisationUrl}/?all=true`)
      .pipe(
        map((res: any) => {
          if (Array.isArray(res)) {
            return res;
          } else if (res && Array.isArray(res.results)) {
            return res.results;
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Check if season name already exists
   */
  checkSeasonExists(seasonName: string, excludeId?: number): Observable<boolean> {
    return this.getSeasons().pipe(
      map((seasons: any[]) => {
        return seasons.some(s =>
          s.season.toLowerCase() === seasonName.toLowerCase() &&
          s.season_id !== excludeId
        );
      })
    );
  }

  /**
   * Get seasons statistics
   */
  getSeasonsStatistics(): Observable<any> {
    return this.getSeasons().pipe(
      map((seasons: any[]) => {
        const total = seasons.length;
        const active = seasons.filter(s => s.status === true && s.deleted === false).length;
        const inactive = seasons.filter(s => s.status === false).length;
        const deleted = seasons.filter(s => s.deleted === true).length;

        return {
          total,
          active,
          inactive,
          deleted
        };
      })
    );
  }

  /**
   * Error handling
   */
  private handleError(error: any) {
    console.error('An error occurred:', error);
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.detail) {
        errorMessage = error.error.detail;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
