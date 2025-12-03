// forecast.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForecastData, WeatherService } from '../shared/weather.service';


@Component({
  selector: 'app-forcast',
  templateUrl: './forcast.component.html',
  styleUrls: ['./forcast.component.css']
})
export class ForcastComponent implements OnInit {
  formValue!: FormGroup;
  forecastDataList: ForecastData[] = [];
  filteredData: ForecastData[] = [];

  loading = false;
  error = '';
  success = '';

  showAdd = true;
  showUpdate = false;

  searchTerm = '';
  selectedData: ForecastData | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(
    private formbuilder: FormBuilder,
    private weatherService: WeatherService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadForecastData();
  }

  initializeForm(): void {
    this.formValue = this.formbuilder.group({
      location: ['', [Validators.required]],
      value: ['', [Validators.required, Validators.min(0)]],
      recorded_at: ['', [Validators.required]],
      start_date: [''],
      end_date: [''],
      status: ['FORECAST']
    });
  }

  loadForecastData(): void {
    this.loading = true;
    this.error = '';

    this.weatherService.getForecastData().subscribe({
      next: (data) => {
        this.forecastDataList = data;
        this.filteredData = data;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load forecast data';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.forecastDataList];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredData = this.forecastDataList.filter(item =>
        item.location.toLowerCase().includes(term) ||
        item.data_type.toLowerCase().includes(term) ||
        item.value.toString().includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
  }

  get paginatedData(): ForecastData[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  openAddModal(): void {
    this.showAdd = true;
    this.showUpdate = false;
    this.formValue.reset({
      status: 'FORECAST'
    });
  }

  openEditModal(data: ForecastData): void {
    this.showAdd = false;
    this.showUpdate = true;
    this.selectedData = data;

    this.formValue.patchValue({
      location: data.location,
      value: data.value,
      recorded_at: this.formatDateTimeForInput(data.recorded_at),
      start_date: data.start_date ? this.formatDateForInput(data.start_date) : '',
      end_date: data.end_date ? this.formatDateForInput(data.end_date) : '',
      status: data.status || 'FORECAST'
    });
  }

  saveData(): void {
    if (this.formValue.invalid) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = '';

    const formData = {
      ...this.formValue.value,
      data_type: 'FORECAST'
    };

    this.weatherService.createForecastData(formData).subscribe({
      next: () => {
        this.success = 'Forecast data added successfully';
        this.closeModal();
        this.loadForecastData();
        this.loading = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to add forecast data';
        this.loading = false;
        console.error(err);
      }
    });
  }

  updateData(): void {
    if (this.formValue.invalid || !this.selectedData) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = '';

    const formData = {
      ...this.formValue.value,
      data_type: 'FORECAST'
    };

    this.weatherService.updateWeatherData(this.selectedData.weather_id, formData).subscribe({
      next: () => {
        this.success = 'Forecast data updated successfully';
        this.closeModal();
        this.loadForecastData();
        this.loading = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to update forecast data';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteData(data: ForecastData): void {
    if (!confirm(`Are you sure you want to delete this forecast data record?`)) {
      return;
    }

    this.loading = true;
    this.weatherService.deleteWeatherData(data.weather_id).subscribe({
      next: () => {
        this.success = 'Forecast data deleted successfully';
        this.loadForecastData();
        this.loading = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete forecast data';
        this.loading = false;
        console.error(err);
      }
    });
  }

  exportData(): void {
    this.weatherService.exportToCSV(this.filteredData, 'forecast-data');
  }

  closeModal(): void {
    this.formValue.reset({
      status: 'FORECAST'
    });
    this.selectedData = null;
    this.showAdd = true;
    this.showUpdate = false;

    // Close Bootstrap modal programmatically
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  formatDateTime(dateString: string): string {
    return this.weatherService.formatDateTime(dateString);
  }

  formatDate(dateString: string): string {
    return this.weatherService.formatDate(dateString);
  }

  private formatDateTimeForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
}
