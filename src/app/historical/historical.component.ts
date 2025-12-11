// historical.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistoricalData, WeatherService } from '../shared/weather.service';

@Component({
  selector: 'app-historical',
  templateUrl: './historical.component.html',
  styleUrls: ['./historical.component.css']
})
export class HistoricalComponent implements OnInit {
  formValue!: FormGroup;
  historicalDataList: HistoricalData[] = [];
  filteredData: HistoricalData[] = [];

  loading = false;
  error = '';
  success = '';

  showAdd = true;
  showUpdate = false;

  searchTerm = '';
  selectedData: HistoricalData | null = null;

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
    this.loadHistoricalData();
  }

  initializeForm(): void {
    this.formValue = this.formbuilder.group({
      location: ['', [Validators.required]],
      value: ['', [Validators.required, Validators.min(0)]],
      recorded_at: ['', [Validators.required]],
      start_date: [''],
      end_date: [''],
      status: ['HISTORICAL']
    });
  }

  loadHistoricalData(): void {
    this.loading = true;
    this.error = '';

    this.weatherService.getHistoricalData().subscribe({
      next: (data) => {
        this.historicalDataList = data.results;
        this.filteredData = data.results;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load historical data';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.historicalDataList];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredData = this.historicalDataList.filter(item =>
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

  get paginatedData(): HistoricalData[] {
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
      status: 'HISTORICAL'
    });
  }

  openEditModal(data: HistoricalData): void {
    this.showAdd = false;
    this.showUpdate = true;
    this.selectedData = data;

    this.formValue.patchValue({
      location: data.location,
      value: data.value,
      recorded_at: this.formatDateTimeForInput(data.recorded_at),
      start_date: data.start_date ? this.formatDateForInput(data.start_date) : '',
      end_date: data.end_date ? this.formatDateForInput(data.end_date) : '',
      status: data.status || 'HISTORICAL'
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
      data_type: 'HISTORICAL'
    };

    this.weatherService.createHistoricalData(formData).subscribe({
      next: () => {
        this.success = 'Historical data added successfully';
        this.closeModal();
        this.loadHistoricalData();
        this.loading = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to add historical data';
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
      data_type: 'HISTORICAL'
    };

    this.weatherService.updateWeatherData(this.selectedData.weather_id, formData).subscribe({
      next: () => {
        this.success = 'Historical data updated successfully';
        this.closeModal();
        this.loadHistoricalData();
        this.loading = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to update historical data';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteData(data: HistoricalData): void {
    if (!confirm(`Are you sure you want to delete this historical data record?`)) {
      return;
    }

    this.loading = true;
    this.weatherService.deleteWeatherData(data.weather_id).subscribe({
      next: () => {
        this.success = 'Historical data deleted successfully';
        this.loadHistoricalData();
        this.loading = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete historical data';
        this.loading = false;
        console.error(err);
      }
    });
  }

  exportData(): void {
    this.weatherService.exportToCSV(this.filteredData, 'historical-data');
  }

  closeModal(): void {
    this.formValue.reset({
      status: 'HISTORICAL'
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
