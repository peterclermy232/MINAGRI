import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FarmService } from 'src/app/shared/farm.service';
import { FarmerService } from 'src/app/shared/farmer.service';
import { PermissionService } from 'src/app/shared/permission.service';

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
  farmer_name?: string;
}

interface Farmer {
  farmer_id: number;
  first_name: string;
  last_name: string;
  id_number: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Farm[];
}

@Component({
  selector: 'app-manage-farms',
  templateUrl: './manage-farms.component.html',
  styleUrls: ['./manage-farms.component.css']
})
export class ManageFarmsComponent implements OnInit {
  farms: Farm[] = [];
  farmers: Farmer[] = [];
  farmForm: FormGroup;
  isEditMode = false;
  selectedFarmId: number | null = null;
  searchTerm = '';
  isLoading = false;
  showModal = false;
  totalCount = 0;
  nextPage: string | null = null;
  previousPage: string | null = null;

  unitOptions = ['Acres', 'Hectares', 'Square Meters'];
  statusOptions = ['ACTIVE', 'INACTIVE'];

  canCreate = false;
  canUpdate = false;
  canDelete = false;
  canRead = false;
  constructor(
    private fb: FormBuilder,
    private farmService: FarmService,
    private farmerService: FarmerService,
    private permissionService: PermissionService,
  ) {
    this.farmForm = this.fb.group({
      farmer: ['', Validators.required],
      farm_name: ['', [Validators.required, Validators.maxLength(200)]],
      farm_size: ['', [Validators.required, Validators.min(0.01)]],
      unit_of_measure: ['Acres', Validators.required],
      location_province: [''],
      location_district: [''],
      location_sector: [''],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.loadFarms();
    this.loadFarmers();
  }

  private loadPermissions(): void {
    this.canCreate = this.permissionService.canCreate('farms');
    this.canUpdate = this.permissionService.canUpdate('farms');
    this.canDelete = this.permissionService.canDelete('farms');
    this.canRead = this.permissionService.canRead('farms');

    console.log('Farm permissions:', {
      canCreate: this.canCreate,
      canUpdate: this.canUpdate,
      canDelete: this.canDelete,
      canRead: this.canRead
    });
  }

  loadFarms(): void {
    this.isLoading = true;

    this.farmService.getFarms().subscribe(
      (response: PaginatedResponse) => {
        this.farms = response.results;
        this.totalCount = response.count;
        this.nextPage = response.next;
        this.previousPage = response.previous;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading farms:', error);
        this.isLoading = false;
        alert('Failed to load farms. Please try again.');
      }
    );
  }

  loadFarmers(): void {
    this.farmerService.getFarmer().subscribe(
      (response: any) => {
        this.farmers = response.results || response;
      },
      (error) => {
        console.error('Error loading farmers:', error);
      }
    );
  }

  openModal(): void {
    this.showModal = true;
    this.isEditMode = false;
    this.farmForm.reset({ status: 'ACTIVE', unit_of_measure: 'Acres' });
  }

  closeModal(): void {
    this.showModal = false;
    this.farmForm.reset();
    this.selectedFarmId = null;
  }

  editFarm(farm: Farm): void {
    this.isEditMode = true;
    this.selectedFarmId = farm.farm_id || null;
    this.showModal = true;

    this.farmForm.patchValue({
      farmer: farm.farmer,
      farm_name: farm.farm_name,
      farm_size: farm.farm_size,
      unit_of_measure: farm.unit_of_measure,
      location_province: farm.location_province,
      location_district: farm.location_district,
      location_sector: farm.location_sector,
      status: farm.status
    });
  }

  deleteFarm(farmId: number): void {
    if (confirm('Are you sure you want to delete this farm?')) {
      this.farmService.deleteFarm(farmId).subscribe(
        () => {
          alert('Farm deleted successfully');
          this.loadFarms();
        },
        (error) => {
          console.error('Error deleting farm:', error);
          alert('Failed to delete farm. Please try again.');
        }
      );
    }
  }

  saveFarm(): void {
    if (this.farmForm.invalid) {
      Object.keys(this.farmForm.controls).forEach(key => {
        this.farmForm.get(key)?.markAsTouched();
      });
      return;
    }

    const farmData = this.farmForm.value;

    if (this.isEditMode && this.selectedFarmId) {
      // Update existing farm
      this.farmService.updateFarm(this.selectedFarmId, farmData).subscribe(
        () => {
          alert('Farm updated successfully');
          this.loadFarms();
          this.closeModal();
        },
        (error) => {
          console.error('Error updating farm:', error);
          alert('Failed to update farm. Please try again.');
        }
      );
    } else {
      // Create new farm
      this.farmService.createFarm(farmData).subscribe(
        () => {
          alert('Farm created successfully');
          this.loadFarms();
          this.closeModal();
        },
        (error) => {
          console.error('Error creating farm:', error);
          alert('Failed to create farm. Please try again.');
        }
      );
    }
  }

  get filteredFarms(): Farm[] {
    if (!this.searchTerm) {
      return this.farms;
    }

    const search = this.searchTerm.toLowerCase();
    return this.farms.filter(farm =>
      farm.farm_name.toLowerCase().includes(search) ||
      farm.location_province?.toLowerCase().includes(search) ||
      farm.location_district?.toLowerCase().includes(search) ||
      farm.farmer_name?.toLowerCase().includes(search)
    );
  }

  getFarmerName(farmerId: number): string {
    const farmer = this.farmers.find(f => f.farmer_id === farmerId);
    return farmer ? `${farmer.first_name} ${farmer.last_name}` : 'Unknown';
  }
}
