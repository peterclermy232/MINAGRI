import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CropResponse } from '../types';

@Injectable({
  providedIn: 'root',
})
export class CropService {
  constructor(private http: HttpClient) {}
  postCrop(data: any) {
    return this.http.post<any>('/crop-insurance/1.0/api/v1/crops', data);
  }
  getCrops() {
    return this.http.get<CropResponse[]>('/crop-insurance/1.0/api/v1/crops');
  }
  updateCrop(data: any, id: number) {
    return this.http.put<any>('/crop-insurance/1.0/api/v1/crops/' + id, data);
  }

  deleteCrop(id: number) {
    console.log('crop to del', id);
    return this.http.delete<any>('/crop-insurance/1.0/api/v1/crops/' + id);
  }
}
