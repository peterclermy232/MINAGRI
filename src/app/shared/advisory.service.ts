// src/app/shared/advisory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Advisory {
  id: number;
  dateTimeAdded: Date;
  province: string;
  district: string;
  sector: string;
  gender: string;
  policyStatus: string;
  message: string;
  sendNow: boolean;
  scheduledDateTime?: Date;
  status: 'Sent' | 'Scheduled' | 'Draft';
  recipientsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvisoryService {
  // Dummy data storage - replace with actual API calls
  private advisories: Advisory[] = [
    {
      id: 1,
      dateTimeAdded: new Date('2024-01-15 10:30:00'),
      province: 'Eastern',
      district: 'Bugesera',
      sector: 'Agriculture',
      gender: 'All',
      policyStatus: 'Active',
      message: 'Reminder: Please ensure your crops are properly insured before the rainy season begins.',
      sendNow: true,
      status: 'Sent',
      recipientsCount: 245
    },
    {
      id: 2,
      dateTimeAdded: new Date('2024-01-20 14:15:00'),
      province: 'Northern',
      district: 'Musanze',
      sector: 'Livestock',
      gender: 'Male',
      policyStatus: 'Pending',
      message: 'New livestock insurance packages available. Contact your nearest agent for details.',
      sendNow: false,
      scheduledDateTime: new Date('2024-02-01 09:00:00'),
      status: 'Scheduled',
      recipientsCount: 156
    },
    {
      id: 3,
      dateTimeAdded: new Date('2024-01-25 16:45:00'),
      province: 'Western',
      district: 'Rubavu',
      sector: 'Fisheries',
      gender: 'Female',
      policyStatus: 'Active',
      message: 'Weather alert: Heavy rains expected. Please take necessary precautions for your fish farms.',
      sendNow: true,
      status: 'Sent',
      recipientsCount: 89
    }
  ];

  constructor(private http: HttpClient) { }

  // Get all advisories
  getAdvisories(): Observable<Advisory[]> {
    // Simulate API call with delay
    return of([...this.advisories]).pipe(delay(300));

    // When backend is ready, use:
    // return this.http.get<Advisory[]>('/api/advisories');
  }

  // Get single advisory by ID
  getAdvisory(id: number): Observable<Advisory | undefined> {
    const advisory = this.advisories.find(a => a.id === id);
    return of(advisory).pipe(delay(200));

    // When backend is ready, use:
    // return this.http.get<Advisory>(`/api/advisories/${id}`);
  }

  // Create new advisory
  createAdvisory(advisory: Omit<Advisory, 'id' | 'dateTimeAdded'>): Observable<Advisory> {
    const newAdvisory: Advisory = {
      ...advisory,
      id: Math.max(...this.advisories.map(a => a.id), 0) + 1,
      dateTimeAdded: new Date()
    };

    this.advisories.unshift(newAdvisory);
    return of(newAdvisory).pipe(delay(500));

    // When backend is ready, use:
    // return this.http.post<Advisory>('/api/advisories', advisory);
  }

  // Update existing advisory
  updateAdvisory(id: number, advisory: Partial<Advisory>): Observable<Advisory> {
    const index = this.advisories.findIndex(a => a.id === id);
    if (index !== -1) {
      this.advisories[index] = { ...this.advisories[index], ...advisory };
      return of(this.advisories[index]).pipe(delay(500));
    }
    throw new Error('Advisory not found');

    // When backend is ready, use:
    // return this.http.put<Advisory>(`/api/advisories/${id}`, advisory);
  }

  // Delete advisory
  deleteAdvisory(id: number): Observable<boolean> {
    const index = this.advisories.findIndex(a => a.id === id);
    if (index !== -1) {
      this.advisories.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false);

    // When backend is ready, use:
    // return this.http.delete<boolean>(`/api/advisories/${id}`);
  }

  // Get provinces (dummy data)
  getProvinces(): Observable<string[]> {
    return of(['Eastern', 'Northern', 'Southern', 'Western', 'Kigali City']).pipe(delay(100));
  }

  // Get districts by province (dummy data)
  getDistricts(province: string): Observable<string[]> {
    const districts: { [key: string]: string[] } = {
      'Eastern': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
      'Northern': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
      'Southern': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
      'Western': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
      'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge']
    };
    return of(districts[province] || []).pipe(delay(100));
  }

  // Get sectors (dummy data)
  getSectors(): Observable<string[]> {
    return of(['Agriculture', 'Livestock', 'Fisheries', 'Forestry', 'Mixed Farming']).pipe(delay(100));
  }

  // Get policy statuses (dummy data)
  getPolicyStatuses(): Observable<string[]> {
    return of(['All', 'Active', 'Pending', 'Expired', 'Cancelled']).pipe(delay(100));
  }

  // Get recipient count estimate
  getRecipientCount(filters: {
    province?: string;
    district?: string;
    sector?: string;
    gender?: string;
    policyStatus?: string;
  }): Observable<number> {
    // Simulate backend calculation
    let count = Math.floor(Math.random() * 500) + 50;
    return of(count).pipe(delay(200));

    // When backend is ready, use:
    // return this.http.post<number>('/api/advisories/recipient-count', filters);
  }

  // Send advisory immediately
  sendAdvisory(id: number): Observable<boolean> {
    const advisory = this.advisories.find(a => a.id === id);
    if (advisory) {
      advisory.status = 'Sent';
      return of(true).pipe(delay(1000));
    }
    return of(false);

    // When backend is ready, use:
    // return this.http.post<boolean>(`/api/advisories/${id}/send`, {});
  }

  // Export advisories to CSV
  exportAdvisories(advisories: Advisory[]): void {
    const headers = ['ID', 'Date Added', 'Province', 'District', 'Sector', 'Gender', 'Policy Status', 'Message', 'Status', 'Recipients'];
    const rows = advisories.map(a => [
      a.id,
      a.dateTimeAdded.toLocaleString(),
      a.province,
      a.district,
      a.sector,
      a.gender,
      a.policyStatus,
      `"${a.message}"`,
      a.status,
      a.recipientsCount
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `advisories_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
