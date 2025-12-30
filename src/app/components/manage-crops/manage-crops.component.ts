import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CropService } from '../../shared/crop.service';
import { NotifierService } from '../../services/notifier.service';
import { PermissionService } from 'src/app/shared/permission.service';

interface Crop {
  crop_id?: number;
  cropId?: number;
  crop: string;
  status: boolean | string | number;
  organisation?: number;
  organisationId?: number;
  organisation_name?: string;
  icon?: string;
  deleted?: boolean;
  recordVersion?: number;
  created_at?: string;
  date_time_added?: string;
  updated_at?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-manage-crops',
  templateUrl: './manage-crops.component.html',
  styleUrls: ['./manage-crops.component.css'],
})
export class ManageCrops implements OnInit {
  @ViewChild('modalButton') modalButton!: ElementRef;

  cropForm: FormGroup;
  formSubmitted = false;
  currentCrop: Crop | null = null;
  searchText: string = '';

  modalMode = {
    label: 'Create Crop',
    typ: 'create',
  };

  modalBtn = {
    loading: false,
    text: 'Create Crop',
    classes: 'btn btn-primary',
  };

  crops = {
    loading: false,
    data: [] as Crop[],
    filteredData: [] as Crop[],
  };

  dataTable = {
    columns: [
      { label: 'Crop Name', data: 'crop', classes: '', dynamic: true },
      { label: 'Organisation', data: 'organisation_name', classes: '', dynamic: true },
      { label: 'Status', data: 'status', classes: 'text-center', dynamic: false },
    ],
  };

  canCreate = false;
  canUpdate = false;
  canDelete = false;
  canRead = false;

  constructor(
    private cropService: CropService,
    private notifierService: NotifierService,
    private fb: FormBuilder,
    private permissionService: PermissionService,
  ) {
    this.cropForm = this.fb.group({
      crop: ['', [Validators.required, Validators.minLength(2)]],
      status: [true, Validators.required],
      cropId: [''],
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.getCrops();
  }

  private loadPermissions(): void {
    this.canCreate = this.permissionService.canCreate('crops');
    this.canUpdate = this.permissionService.canUpdate('crops');
    this.canDelete = this.permissionService.canDelete('crops');
    this.canRead = this.permissionService.canRead('crops');

    console.log('Crops permissions:', {
      canCreate: this.canCreate,
      canUpdate: this.canUpdate,
      canDelete: this.canDelete,
      canRead: this.canRead
    });
  }
  showModal(crop?: Crop): void {
    if (crop) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit Crop';
      this.modalBtn = { text: 'Update Crop', classes: 'btn btn-warning', loading: false };
      this.currentCrop = crop;
      this.setCropInfo(crop);
    } else {
      this.modalMode.typ = 'create';
      this.modalMode.label = 'Create Crop';
      this.modalBtn = { text: 'Create Crop', classes: 'btn btn-primary', loading: false };
      this.currentCrop = null;
      this.resetForm();
    }
  }

  setCropInfo(crop: Crop): void {
    const id = crop.crop_id ?? crop.cropId;
    const isActive = this.isActive(crop.status);

    this.cropForm.patchValue({
      crop: crop.crop,
      status: isActive,
      cropId: id,
    });
  }

  getCrops(): void {
  this.crops.loading = true;

  this.cropService.getCrops()
    .pipe(finalize(() => (this.crops.loading = false)))
    .subscribe({
      next: (resp: any) => {
        // Extract results array
        const cropsData = resp.cropsResponse?.results ?? resp.cropsResponse ?? [];
        const orgsData = resp.orgsResponse?.results ?? resp.orgsResponse ?? [];

        this.crops.data = cropsData.map((crop: any) => {
          const org = orgsData.find(
            (o: any) =>
              o.organisation_id === (crop.organisation ?? crop.organisationId)
          );

          return {
            crop_id: crop.crop_id ?? crop.cropId,
            cropId: crop.crop_id ?? crop.cropId,
            crop: crop.crop,
            status: crop.status,
            organisation: crop.organisation ?? crop.organisationId,
            organisationId: crop.organisation ?? crop.organisationId,
            organisation_name: org ? org.organisation_name : crop.organisation_name ?? 'Unknown',
            icon: crop.icon,
            recordVersion: crop.recordVersion ?? crop.record_version,
            created_at: crop.created_at ?? crop.date_time_added,
            date_time_added: crop.date_time_added,
          };
        });

        this.crops.filteredData = [...this.crops.data];
      },
      error: (err) => {
        this.notifierService.showSweetAlert({
          typ: 'error',
          message: err.error?.detail || 'Failed to load crops',
        });
        this.crops.data = [];
        this.crops.filteredData = [];
      },
    });
}


  // ------------------- CREATE CROP -------------------
  createCrop(): void {
  this.modalBtn.loading = true;

  // Build payload once
  const payload = {
    crop: this.cropForm.value.crop,
    status: this.cropForm.value.status,
    deleted: false,
    organisation: 1,        // FK field for Django
    request_type: 'cropApi',
    icon: 'no icon'
  };

  console.log('payload to send:', payload);

  this.cropService.postCrop(payload)
    .pipe(finalize(() => (this.modalBtn.loading = false)))
    .subscribe({
      next: () => {
        this.modalButton.nativeElement.click();
        this.resetForm();
        this.getCrops();
        this.notifierService.showSweetAlert({ typ: 'success', message: 'Crop successfully created!', timer: true });
      },
      error: (err) => {
        const msg =
          err.error?.crop?.[0] ||
          err.error?.organisation?.[0] ||
          err.error?.detail ||
          err.error ||
          'Failed to create crop';
        this.notifierService.showSweetAlert({ typ: 'error', message: msg });
      },
    });
}


  // ------------------- UPDATE CROP -------------------
  updateCrop(): void {
  const cropId = this.cropForm.value.cropId;
  if (!cropId) return;

  this.modalBtn.loading = true;

  const payload = {
    crop: this.cropForm.value.crop,
    status: this.cropForm.value.status,
    organisation: 1,
    deleted: false,
    request_type: 'cropApi',
    icon: 'no icon'
  };

  this.cropService.updateCrop(payload, cropId)
    .pipe(finalize(() => (this.modalBtn.loading = false)))
    .subscribe({
      next: () => {
        this.modalButton.nativeElement.click();
        this.resetForm();
        this.getCrops();
        this.notifierService.showSweetAlert({ typ: 'success', message: 'Crop updated!', timer: true });
      },
      error: (err) => {
        const msg =
          err.error?.crop?.[0] ||
          err.error?.organisation?.[0] ||
          err.error?.detail ||
          err.error ||
          'Failed to update crop';
        this.notifierService.showSweetAlert({ typ: 'error', message: msg });
      },
    });
}


  // ------------------- DELETE CROP -------------------
  deleteCrop(crop: Crop): void {
    const cropId = crop.crop_id ?? crop.cropId;
    if (!cropId) {
      this.notifierService.showSweetAlert({ typ: 'error', message: 'Invalid crop ID' });
      return;
    }

    this.notifierService.confirm(`Are you sure you want to delete "${crop.crop}"?`)
      .then((yes: boolean) => {
        if (!yes) return;

        this.crops.loading = true;

        this.cropService.deleteCrop(cropId)
          .pipe(finalize(() => (this.crops.loading = false)))
          .subscribe({
            next: () => {
              this.getCrops();
              this.notifierService.showSweetAlert({ typ: 'success', message: 'Crop deleted', timer: true });
            },
            error: (err) => {
              const msg = err.error?.detail || 'Failed to delete crop';
              this.notifierService.showSweetAlert({ typ: 'error', message: msg });
            },
          });
      });
  }

  // ------------------- SEARCH -------------------
  onSearchChange(): void {
    const text = this.searchText.toLowerCase().trim();
    if (!text) {
      this.crops.filteredData = [...this.crops.data];
      return;
    }

    this.crops.filteredData = this.crops.data.filter((c) => {
      const cropName = String(c.crop ?? '').toLowerCase();
      const orgName = String(c.organisation_name ?? '').toLowerCase();
      const status = this.getStatusText(c.status).toLowerCase();

      return cropName.includes(text) || orgName.includes(text) || status.includes(text);
    });
  }

  resetForm(): void {
    this.cropForm.reset({ crop: '', status: true, cropId: '' });
    this.cropForm.markAsPristine();
    this.cropForm.markAsUntouched();
    this.formSubmitted = false;
    this.modalBtn = { loading: false, text: 'Create Crop', classes: 'btn btn-primary' };
  }

  handleSubmit(): void {
    this.formSubmitted = true;
    if (this.cropForm.invalid) {
      Object.values(this.cropForm.controls).forEach((ctrl) => ctrl.markAsTouched());
      return;
    }

    this.formSubmitted = false;
    if (this.cropForm.value.cropId) {
      this.updateCrop();
    } else {
      this.createCrop();
    }
  }

  getStatusText(status: any): string {
    return this.isActive(status) ? 'Active' : 'Inactive';
  }

  isActive(status: any): boolean {
    return status === true || status === 1 || status === 'true' || status === 'ACTIVE';
  }
}
