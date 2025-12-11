import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  results: any[];
}

export interface ForecastData extends WeatherData {
  data_type: 'FORECAST';
  results: any[];
}

export interface HistoricalData extends WeatherData {
  data_type: 'HISTORICAL';
}
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private baseUrl = `${environment.apiUrl}/weather_data`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Get all weather data
  getAllWeatherData(): Observable<WeatherData[]> {
    return this.http.get<WeatherData[]>(`${this.baseUrl}/`, {
      headers: this.getHeaders()
    });
  }

  // Get forecast data
  getForecastData(): Observable<PaginatedResponse<ForecastData>> {
    return this.http.get<PaginatedResponse<ForecastData>>(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
      params: { type: 'FORECAST' }
    });
  }

  // Get historical data
  getHistoricalData(): Observable<PaginatedResponse<HistoricalData>> {
    return this.http.get<PaginatedResponse<HistoricalData>>(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
      params: { type: 'HISTORICAL' }
    });
  }

  // Get single weather data
  getWeatherDataById(id: number): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.baseUrl}/${id}/`, {
      headers: this.getHeaders()
    });
  }

  // Create forecast data
  createForecastData(data: any): Observable<ForecastData> {
    return this.http.post<ForecastData>(`${this.baseUrl}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Create historical data
  createHistoricalData(data: any): Observable<HistoricalData> {
    return this.http.post<HistoricalData>(`${this.baseUrl}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Update weather data
  updateWeatherData(id: number, data: any): Observable<WeatherData> {
    return this.http.put<WeatherData>(`${this.baseUrl}/${id}/`, data, {
      headers: this.getHeaders()
    });
  }

  // Delete weather data
  deleteWeatherData(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`, {
      headers: this.getHeaders()
    });
  }

  // Export to CSV
  exportToCSV(data: any[], filename: string): void {
    const headers = [
      'ID', 'Location', 'Data Type', 'Value',
      'Recorded At', 'Start Date', 'End Date',
      'Status', 'Date Added'
    ];

    const rows = data.map(item => [
      item.weather_id || '',
      item.location || '',
      item.data_type || '',
      item.value || '',
      this.formatDateTime(item.recorded_at),
      this.formatDate(item.start_date || ''),
      this.formatDate(item.end_date || ''),
      item.status || '',
      this.formatDateTime(item.date_time_added)
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    rows.forEach(rowArray => {
      csvContent += rowArray.map(field => `"${field}"`).join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Format datetime for display
  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
