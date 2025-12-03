// weather.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface WeatherData {
  weather_id: number;
  location: string;
  data_type: string;
  value: number;
  recorded_at: string;
  date_time_added: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface HistoricalData extends WeatherData {
  data_type: 'HISTORICAL';
}

export interface ForecastData extends WeatherData {
  data_type: 'FORECAST';
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = `${environment.apiUrl}/weather_data`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ============== WEATHER DATA ENDPOINTS ==============

  getWeatherData(params?: any): Observable<WeatherData[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<WeatherData[]>(`${this.apiUrl}/`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getWeatherDataById(id: number): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/${id}/`, {
      headers: this.getHeaders()
    });
  }

  createWeatherData(data: Partial<WeatherData>): Observable<WeatherData> {
    return this.http.post<WeatherData>(`${this.apiUrl}/`, data, {
      headers: this.getHeaders()
    });
  }

  updateWeatherData(id: number, data: Partial<WeatherData>): Observable<WeatherData> {
    return this.http.patch<WeatherData>(`${this.apiUrl}/${id}/`, data, {
      headers: this.getHeaders()
    });
  }

  deleteWeatherData(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`, {
      headers: this.getHeaders()
    });
  }

  // ============== HISTORICAL DATA METHODS ==============

  getHistoricalData(params?: any): Observable<HistoricalData[]> {
    return this.getWeatherData({ ...params, type: 'HISTORICAL' }) as Observable<HistoricalData[]>;
  }

  createHistoricalData(data: Partial<HistoricalData>): Observable<HistoricalData> {
    return this.createWeatherData({ ...data, data_type: 'HISTORICAL' }) as Observable<HistoricalData>;
  }

  // ============== FORECAST DATA METHODS ==============

  getForecastData(params?: any): Observable<ForecastData[]> {
    return this.getWeatherData({ ...params, type: 'FORECAST' }) as Observable<ForecastData[]>;
  }

  createForecastData(data: Partial<ForecastData>): Observable<ForecastData> {
    return this.createWeatherData({ ...data, data_type: 'FORECAST' }) as Observable<ForecastData>;
  }

  // ============== UTILITY METHODS ==============

  exportToCSV(data: WeatherData[], filename: string): void {
    const headers = [
      'Date Time Added',
      'Location',
      'Data Type',
      'Value',
      'Recorded At',
      'Start Date',
      'End Date',
      'Status'
    ];

    const rows = data.map(item => [
      this.formatDateTime(item.date_time_added),
      item.location,
      item.data_type,
      item.value.toString(),
      this.formatDateTime(item.recorded_at),
      item.start_date || 'N/A',
      item.end_date || 'N/A',
      item.status || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell =>
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}
