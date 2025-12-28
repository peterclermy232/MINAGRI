import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FarmerService } from 'src/app/shared/farmer.service';
import { FarmerModel } from './manage-farmers';

@Component({
  selector: 'app-manage-farmers',
  templateUrl: './manage-farmers.component.html',
  styleUrls: ['./manage-farmers.component.css']
})
export class ManageFarmersComponent implements OnInit {

  formValue!: FormGroup;
  farmerModelObj: FarmerModel = new FarmerModel();
  farmerData: any[] = [];
  filteredFarmers: any[] = [];
  showAdd: boolean = false;
  showUpdate: boolean = false;
  searchText: string = '';
  page: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  isLoading: boolean = false;

  constructor(
    private formbuilder: FormBuilder,
    private api: FarmerService
  ) { }

  ngOnInit(): void {
    console.log('=== Component Initializing ===');

    // Initialize form
    this.formValue = this.formbuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      id_number: ['', Validators.required],
      phone_number: ['', Validators.required],
      email: ['', [Validators.email]],
      gender: [''],
      date_of_birth: [''],
      farmer_category: [''],
      organisation: [1], // Default organization ID
      country: [1], // Default country ID
      status: ['ACTIVE']
    });

    // Initialize arrays to empty to prevent iteration errors
    this.farmerData = [];
    this.filteredFarmers = [];

    // Load data from backend
    this.getAllFarmers();
  }

  clickAddEmployee() {
    this.formValue.reset();
    this.formValue.patchValue({
      organisation: 1,
      country: 1,
      status: 'ACTIVE'
    });
    this.showAdd = true;
    this.showUpdate = false;
  }

  /**
   * Get all farmers from backend API
   */
  getAllFarmers() {
    this.isLoading = true;
    this.api.getFarmer(this.searchText).subscribe({
      next: (res) => {
        console.log('Farmers loaded from API:', res);

        // Handle different response formats
        if (Array.isArray(res)) {
          this.farmerData = res;
        } else if (res && Array.isArray(res.results)) {
          this.farmerData = res.results;
        } else if (res && res.data && Array.isArray(res.data)) {
          this.farmerData = res.data;
        } else {
          console.error('Unexpected response format:', res);
          this.farmerData = [];
        }

        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading farmers:', error);
        this.farmerData = [];
        this.filteredFarmers = [];
        this.isLoading = false;
        alert('Failed to load farmers. Please try again.');
      }
    });
  }

  /**
   * Create a new farmer
   */
  postEmployeeDetails() {
    // Mark all fields as touched to show validation errors
    Object.keys(this.formValue.controls).forEach(key => {
      this.formValue.get(key)?.markAsTouched();
    });

    if (this.formValue.invalid) {
      alert('Please fill in all required fields correctly');
      return;
    }

    this.isLoading = true;
    const farmerData = this.formValue.value;

    this.api.postFarmer(farmerData).subscribe({
      next: (res) => {
        console.log('Farmer created:', res);
        alert('Farmer Added Successfully');
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.formValue.patchValue({
          organisation: 1,
          country: 1,
          status: 'ACTIVE'
        });
        this.getAllFarmers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating farmer:', error);
        this.isLoading = false;
        const errorMsg = error.error?.detail || error.error?.message || 'Something went wrong';
        alert(`Failed to add farmer: ${errorMsg}`);
      }
    });
  }

  /**
   * Load farmer data for editing
   */
  onEdit(farmer: any) {
    console.log('Editing farmer:', farmer);
    this.showAdd = false;
    this.showUpdate = true;
    this.farmerModelObj.id = farmer.farmer_id;

    this.formValue.patchValue({
      first_name: farmer.first_name,
      last_name: farmer.last_name,
      id_number: farmer.id_number,
      phone_number: farmer.phone_number,
      email: farmer.email || '',
      gender: farmer.gender || '',
      date_of_birth: farmer.date_of_birth || '',
      farmer_category: farmer.farmer_category || '',
      organisation: farmer.organisation,
      country: farmer.country,
      status: farmer.status
    });
  }

  /**
   * Update existing farmer
   */
  updateEmployeeDetails() {
    // Mark all fields as touched to show validation errors
    Object.keys(this.formValue.controls).forEach(key => {
      this.formValue.get(key)?.markAsTouched();
    });

    if (this.formValue.invalid) {
      alert('Please fill in all required fields correctly');
      return;
    }

    if (!this.farmerModelObj.id) {
      alert('Invalid farmer ID');
      return;
    }

    this.isLoading = true;
    const farmerData = this.formValue.value;

    this.api.updateFarmer(farmerData, this.farmerModelObj.id).subscribe({
      next: (res) => {
        console.log('Farmer updated:', res);
        alert('Updated Successfully');
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.formValue.patchValue({
          organisation: 1,
          country: 1,
          status: 'ACTIVE'
        });
        this.getAllFarmers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating farmer:', error);
        this.isLoading = false;
        const errorMsg = error.error?.detail || error.error?.message || 'Something went wrong';
        alert(`Failed to update farmer: ${errorMsg}`);
      }
    });
  }

  /**
   * Delete farmer
   */
  deleteFarmer(id: number) {
    if (confirm('Are you sure you want to delete this farmer?')) {
      this.isLoading = true;
      this.api.deleteFarmer(id).subscribe({
        next: (res) => {
          console.log('Farmer deleted:', res);
          alert('Farmer deleted successfully');
          this.getAllFarmers();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting farmer:', error);
          this.isLoading = false;
          alert('Failed to delete farmer');
        }
      });
    }
  }

  /**
   * Handle search text change
   */
  onSearchChange() {
    console.log('Search text changed:', this.searchText);
    this.page = 1;

    // If using backend search (recommended for large datasets)
    this.getAllFarmers();

    // If using client-side filtering (for small datasets)
    // this.applyFilters();
  }

  /**
   * Apply client-side filters and pagination
   */
  applyFilters() {
    console.log('=== Applying Filters ===');
    console.log('Current page:', this.page);
    console.log('Page size:', this.pageSize);
    console.log('Total farmerData:', this.farmerData?.length || 0);

    // Ensure farmerData is an array
    if (!Array.isArray(this.farmerData)) {
      console.error('farmerData is not an array:', this.farmerData);
      this.farmerData = [];
      this.filteredFarmers = [];
      this.totalPages = 1;
      return;
    }

    // Start with all data
    let data = [...this.farmerData];

    // Note: Search filtering is now handled by backend
    // This client-side filtering can be removed if using backend search
    if (this.searchText && this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase().trim();
      console.log('Client-side filtering by:', searchLower);

      data = data.filter(item => {
        const firstName = (item.first_name || '').toLowerCase();
        const lastName = (item.last_name || '').toLowerCase();
        const email = (item.email || '').toLowerCase();
        const phoneNumber = (item.phone_number || '').toString();
        const idNumber = (item.id_number || '').toString();

        return firstName.includes(searchLower) ||
               lastName.includes(searchLower) ||
               email.includes(searchLower) ||
               phoneNumber.includes(searchLower) ||
               idNumber.includes(searchLower);
      });

      console.log('After filtering:', data.length, 'items');
    }

    // Calculate pagination
    this.totalPages = Math.ceil(data.length / this.pageSize) || 1;
    console.log('Total pages:', this.totalPages);

    // Ensure current page is valid
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
    if (this.page < 1) {
      this.page = 1;
    }

    // Apply pagination
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    console.log('Slice from', start, 'to', end);

    this.filteredFarmers = data.slice(start, end);

    console.log('Final filteredFarmers length:', this.filteredFarmers.length);
  }

  nextPage() {
    console.log('Next page clicked');
    if (this.page < this.totalPages) {
      this.page++;
      this.applyFilters();
    }
  }

  prevPage() {
    console.log('Previous page clicked');
    if (this.page > 1) {
      this.page--;
      this.applyFilters();
    }
  }
}

