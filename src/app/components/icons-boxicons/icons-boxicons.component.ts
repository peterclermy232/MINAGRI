import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CropService } from 'src/app/shared/crop.service';
import { Crop, CropVariety } from '../../types';
import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-icons-boxicons',
  templateUrl: './icons-boxicons.component.html',
  styleUrls: ['./icons-boxicons.component.css'],
})
export class IconsBoxiconsComponent implements OnInit {
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
  cropVarieties: {
    loading: boolean;
    data: CropVariety[];
  } = {
    loading: false,
    data: [],
  };
  crops: {
    loading: boolean;
    data: Crop[];
  } = {
    loading: false,
    data: [],
  };
  dataTable = {
    columns: [
      {
        label: 'Crop Variety',
        data: 'cropVariety',
        classes: '',
      },
      {
        label: 'Crop',
        data: 'crop',
        classes: '',
      },
      {
        label: 'Organization',
        data: 'organisationId',
        classes: '',
      },
      {
        label: 'Status',
        data: 'status',
        classes: 'text-center',
      },
    ],
  };
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cropService: CropService,
    private fb: FormBuilder
  ) {
    this.cropVarietyForm = this.fb.group({
      crop_variety: ['', [Validators.required]],
      crop_id: ['', [Validators.required]],
      status: [true, Validators.required],
      cropVarietyId: [''],
    });
  }
  ngOnInit(): void {
    this.getCropVarieties();
    this.getCrops();
  }

  showModal(crop?: CropVariety) {
    if (crop) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit Crop Variety';
      this.modalBtn = {
        text: 'Edit Crop Variety',
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
    this.cropVarietyForm.get('crop_id')!.setValue(crop.cropId);
    this.cropVarietyForm.get('crop_variety')!.setValue(crop.cropVariety);
    this.cropVarietyForm.get('status')!.setValue(crop.status);
    this.cropVarietyForm.get('cropVarietyId')!.setValue(crop.cropVarietyId);
  }
  getItems() {
    this.getCrops();
    this.getCropVarieties();
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
        (resp) => {
          this.cropVarieties.data = resp;
        },
        (err) => {
          console.log('crop var err', err);
        }
      );
  }
  getCrops() {
    this.cropVarieties.loading = true;
    this.cropService
      .getCrops()
      .pipe(
        finalize(() => {
          this.crops.loading = false;
        })
      )
      .subscribe(
        (resp) => {
          this.crops.data = resp;
        },
        (err) => {
          console.log('crop err', err);
        }
      );
  }
  createCropVariety() {
    console.log('creating variety');
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.cropService
      .postCropVariety({
        cropId: this.cropVarietyForm.get('crop_id')?.value,
        cropVariety: this.cropVarietyForm.get('crop_variety')?.value,
        deleted: false,
        organisationId: 1,
        status: this.cropVarietyForm.get('status')?.value,
      })
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
          console.log('create resp', resp);
          Swal.fire('Success!', 'Crop Variety successfully created', 'success');
          this.resetForm();
          this.getCropVarieties();
        },
        (err) => {
          console.log('crop err', err);
          this.alertWithError();
        }
      );
  }
  updateCropVariety() {
    console.log('updating variety');
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    // console.log('varietyform', this.cropVarietyForm);
    this.cropService
      .updateCropVariety(
        {
          cropId: this.cropVarietyForm.get('crop_id')?.value,
          cropVarietyId: this.cropVarietyForm.get('cropVarietyId')!.value,
          cropVariety: this.cropVarietyForm.get('crop_variety')!.value,
          deleted: false,
          organisationId: 1,
          status: this.cropVarietyForm.get('status')?.value,
          recordVersion: this.currentCrop?.recordVersion,
        },
        this.cropVarietyForm.get('crop_id')!.value
      )
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Update Crop Variety',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('create resp', resp);
          Swal.fire('Success!', 'Crop Variety successfully updated', 'success');
          this.resetForm();
          this.getCropVarieties();
        },
        (err) => {
          console.log('crop err', err);
          this.alertWithError();
        }
      );
  }

  deleteCropVariety() {
    const cId = this.currentCrop!.cropId;
    if (!cId) {
      return;
    }
    this.cropService.deleteCrop(cId).subscribe(
      (resp) => {
        Swal.fire('Deleted!', 'Crop Variety successfully deleted', 'success');
        this.getCropVarieties();
      },
      (err) => {
        console.log('crop err', err);
        this.alertWithError();
      }
    );
  }

  resetForm() {
    this.cropVarietyForm.reset();
    this.cropVarietyForm.markAsPristine();
    this.modalBtn = {
      loading: false,
      text: 'Create Variety Crop',
      classes: 'btn btn-primary',
    };
  }

  handleSubmit() {
    if (this.cropVarietyForm.invalid) {
      console.log('invalid');
      this.formSubmitted = true;
      return;
    }

    this.formSubmitted = false;
    if (this.cropVarietyForm.get('cropVarietyId')?.value) {
      this.updateCropVariety();
    } else {
      this.createCropVariety();
    }
  }

  alertWithSuccess() {
    Swal.fire('Thank you...', 'You submitted succesfully!', 'success');
  }
  alertWithError() {
    Swal.fire('Error Occurred!', 'Try again later!', 'error');
  }

  confirmBox(crop: CropVariety) {
    this.currentCrop = crop;
    Swal.fire({
      title: 'Are you sure want to delete crop variety?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.value) {
        this.deleteCropVariety();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'delete cancelled)', 'error');
      }
    });
  }

  get cropsWithVarieties() {
    if (this.crops.data.length > 0 && this.cropVarieties.data.length > 0) {
      return this.cropVarieties.data.map((cVar) => {
        const cropName = this.crops.data.find(
          (cp) => cp.cropId === cVar.cropId
        );
        return {
          ...cVar,
          crop: cropName ? cropName.crop : 'crop',
        };
      });
    } else {
      return [];
    }
  }
}
