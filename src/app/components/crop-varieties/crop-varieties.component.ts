import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CropService } from 'src/app/shared/crop.service';
import { Crop, CropVariety } from '../../types';
import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { NotifierService } from '../../services/notifier.service';
import { PermissionService } from 'src/app/shared/permission.service';

@Component({
  selector: 'app-crop-varieties',
  templateUrl: './crop-varieties.component.html',
  styleUrls: ['./crop-varieties.component.css'],
})
export class CropVarietiesComponent implements OnInit {
  cropVarietyForm: FormGroup;
  formSubmitted = false;
  currentCrop: null | CropVariety = null;
  modalMode = {
    label: 'Create Crop Variety',
    typ: 'Create',
  };
  modalBtn = {
    loading: false,
    text: 'Create Crop Variety',
    classes: 'btn btn-primary',
  };
  crops: Crop[] = [];
  cropVarieties: {
    loading: boolean;
    data: any[];
  } = {
    loading: false,
    data: [],
  };
  dataTable = {
    columns: [
      {
        label: 'Crop Variety',
        data: 'crop_variety',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Crop',
        data: 'crop_name',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Organization',
        data: 'organisation_name',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Status',
        data: 'status',
        dynamic: false,
        classes: 'text-center',
      },
    ],
  };

  canCreate = false;
  canUpdate = false;
  canDelete = false;
  canRead = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cropService: CropService,
    private notifierService: NotifierService,
    private fb: FormBuilder,
    private permissionService: PermissionService,
  ) {
    this.cropVarietyForm = this.fb.group({
      crop_variety: ['', [Validators.required, Validators.minLength(2)]],
      crop: ['', [Validators.required]],
      status: [true, Validators.required],
      crop_variety_id: [''],
      organisation: [''],
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.getCropVarieties();
    this.loadCrops();
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
  showModal(crop?: CropVariety) {
    if (crop) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit Crop Variety';
      this.modalBtn = {
        text: 'Update Crop Variety',
        classes: 'btn btn-warning',
        loading: false,
      };
      this.currentCrop = crop;
      this.setCropInfo(crop);
    } else {
      this.modalMode.typ = 'create';
      this.modalMode.label = 'Create Crop Variety';
      this.modalBtn = {
        text: 'Create Crop Variety',
        classes: 'btn btn-primary',
        loading: false,
      };
      this.resetForm();
    }
  }

  setCropInfo(crop: CropVariety) {
    // Map backend field names to form controls
    this.cropVarietyForm.patchValue({
      crop: crop.cropId || crop.crop, // Use cropId alias
      crop_variety: crop.cropVariety || crop.crop_variety,
      status: crop.status,
      organisation: crop.organisationId || crop.organisation,
      crop_variety_id: crop.cropVarietyId || crop.crop_variety_id,
    });
  }

  loadCrops() {
    this.cropService.getCrops().subscribe(
      (resp: any) => {
        console.log('Crops response:', resp);

        // Handle different response formats
        let cropsArray: any[] = [];

        if (Array.isArray(resp)) {
          // Direct array response
          cropsArray = resp;
        } else if (resp.results && Array.isArray(resp.results)) {
          // Paginated response with results array
          cropsArray = resp.results;
        } else if (resp.cropsResponse) {
          // Custom response format from with_details endpoint
          if (Array.isArray(resp.cropsResponse)) {
            cropsArray = resp.cropsResponse;
          } else if (resp.cropsResponse.results && Array.isArray(resp.cropsResponse.results)) {
            cropsArray = resp.cropsResponse.results;
          } else if (typeof resp.cropsResponse === 'object') {
            // If cropsResponse is an object, try to convert it to array
            cropsArray = Object.values(resp.cropsResponse);
          }
        } else {
          console.warn('Unexpected crops response format:', resp);
          cropsArray = [];
        }

        console.log('Extracted crops array:', cropsArray);

        // Map to match types.d.ts
        this.crops = cropsArray.map((crop: any) => ({
          ...crop,
          cropId: crop.crop_id || crop.cropId,
          organisationId: crop.organisation || crop.organisationId,
        }));

        console.log('Mapped crops:', this.crops);
      },
      (err) => {
        console.error('Error loading crops:', err);
        this.notifierService.showSweetAlert({
          typ: 'error',
          message: 'Failed to load crops',
        });
      }
    );
  }

  getCropVarieties() {
    this.cropVarieties.loading = true;
    this.cropService
      .getCropVarieties()
      .pipe(
        finalize(() => {
          this.cropVarieties.loading = false;
        })
      )
      .subscribe(
        (resp: any) => {
          console.log('Crop varieties response:', resp);

          // Handle different response formats
          let varietiesArray: any[] = [];

          if (Array.isArray(resp)) {
            // Direct array response
            varietiesArray = resp;
          } else if (resp.results && Array.isArray(resp.results)) {
            // Paginated response with results array
            varietiesArray = resp.results;
          } else if (resp.cropVarResponse && Array.isArray(resp.cropVarResponse)) {
            // Custom response format (from with_details endpoint)
            varietiesArray = resp.cropVarResponse;
          } else {
            console.warn('Unexpected crop varieties response format:', resp);
            varietiesArray = [];
          }

          // Map to match existing types.d.ts interface
          this.cropVarieties.data = varietiesArray.map((variety: any) => ({
            ...variety,
            cropVarietyId: variety.crop_variety_id || variety.cropVarietyId,
            cropVariety: variety.crop_variety || variety.cropVariety,
            cropId: variety.crop || variety.cropId,
            crop_name: variety.crop_name || 'N/A',
            organisationId: variety.organisation || variety.organisationId,
            organisation_name: variety.organisation_name || 'N/A',
          }));

          console.log('Mapped varieties:', this.cropVarieties.data);
        },
        (err) => {
          console.error('Crop varieties error:', err);
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: 'Failed to load crop varieties',
          });
        }
      );
  }

  createCropVariety() {
    console.log('Creating variety');
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };

    // Get organization ID from AuthService
    const organisationId = this.authService.getCurrentUserOrganizationId();

    const payload = {
      crop: this.cropVarietyForm.get('crop')?.value,
      crop_variety: this.cropVarietyForm.get('crop_variety')?.value,
      organisation: organisationId,
      status: this.cropVarietyForm.get('status')?.value,
      deleted: false,
    };

    console.log('Create payload:', payload);

    this.cropService
      .postCropVariety(payload)
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create Crop Variety',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('Create response:', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Crop variety successfully created!',
            timer: true,
          });
          this.resetForm();
          this.getCropVarieties();

          // Close modal
          const closeBtn = document.getElementById('cancel') as HTMLElement;
          closeBtn?.click();
        },
        (err) => {
          console.error('Create error:', err);
          let errorMessage = 'Failed to create crop variety';

          if (err.error) {
            if (typeof err.error === 'string') {
              errorMessage = err.error;
            } else if (err.error.detail) {
              errorMessage = err.error.detail;
            } else if (err.error.crop_variety) {
              errorMessage = Array.isArray(err.error.crop_variety)
                ? err.error.crop_variety[0]
                : err.error.crop_variety;
            }
          }

          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }

  updateCropVariety() {
    console.log('Updating variety');
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-warning',
    };

    const cropVarietyId = this.cropVarietyForm.get('crop_variety_id')?.value;

    const payload = {
      crop: this.cropVarietyForm.get('crop')?.value,
      crop_variety: this.cropVarietyForm.get('crop_variety')?.value,
      organisation: this.cropVarietyForm.get('organisation')?.value,
      status: this.cropVarietyForm.get('status')?.value,
      deleted: false,
      record_version: this.currentCrop?.record_version || 1,
    };

    this.cropService
      .updateCropVariety(cropVarietyId, payload)
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Update Crop Variety',
            classes: 'btn btn-warning',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('Update response:', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Crop variety successfully updated!',
            timer: true,
          });
          this.resetForm();
          this.getCropVarieties();

          // Close modal
          const closeBtn = document.getElementById('cancel') as HTMLElement;
          closeBtn?.click();
        },
        (err) => {
          console.error('Update error:', err);
          let errorMessage = 'Failed to update crop variety';

          if (err.error) {
            if (typeof err.error === 'string') {
              errorMessage = err.error;
            } else if (err.error.detail) {
              errorMessage = err.error.detail;
            }
          }

          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }

  deleteCropVariety(variety: CropVariety) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the crop variety "${variety.cropVariety || variety.crop_variety}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const varietyId = variety.cropVarietyId || variety.crop_variety_id;
        this.cropService.deleteCropVariety(varietyId).subscribe(
          () => {
            this.notifierService.showSweetAlert({
              typ: 'success',
              message: 'Crop variety deleted successfully!',
              timer: true,
            });
            this.getCropVarieties();
          },
          (err) => {
            console.error('Delete error:', err);
            this.notifierService.showSweetAlert({
              typ: 'error',
              message: 'Failed to delete crop variety',
            });
          }
        );
      }
    });
  }

  resetForm() {
    this.cropVarietyForm.reset({
      status: true,
      crop_variety: '',
      crop: '',
      organisation: '',
      crop_variety_id: '',
    });
    this.cropVarietyForm.markAsPristine();
    this.cropVarietyForm.markAsUntouched();
    this.formSubmitted = false;
    this.currentCrop = null;
  }

  handleSubmit() {
    this.formSubmitted = true;

    if (this.cropVarietyForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.formSubmitted = false;

    if (this.cropVarietyForm.get('crop_variety_id')?.value) {
      this.updateCropVariety();
    } else {
      this.createCropVariety();
    }
  }
}
