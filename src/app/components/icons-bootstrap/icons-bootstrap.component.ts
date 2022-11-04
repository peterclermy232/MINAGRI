import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Crop } from '../../types';
import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
import { CropService } from '../../shared/crop.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-icons-bootstrap',
  templateUrl: './icons-bootstrap.component.html',
  styleUrls: ['./icons-bootstrap.component.css'],
})
export class IconsBootstrapComponent implements OnInit {
  cropForm: FormGroup;
  formSubmitted = false;
  currentCrop: null | Crop = null;
  modalMode = {
    label: 'Create Crop',
    typ: 'Create',
  };
  modalBtn = {
    loading: false,
    text: 'Create Crop',
    classes: 'btn btn-primary',
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
    this.cropForm = this.fb.group({
      crop: ['', [Validators.required]],
      status: [true, Validators.required],
      cropId: [''],
    });
  }
  ngOnInit(): void {
    this.getCrops();
  }

  showModal(crop?: Crop) {
    if (crop) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit Crop';
      this.modalBtn = {
        text: 'Edit Crop',
        classes: 'btn btn-warning',
        loading: false,
      };
      this.currentCrop = crop;
      this.setCropInfo(crop);
    } else {
      this.modalMode.typ = 'create';
      this.modalMode.label = 'Create Crop';
      this.modalBtn = {
        text: 'Create Crop',
        classes: 'btn btn-primary',
        loading: false,
      };
      this.resetForm();
    }
  }
  setCropInfo(crop: Crop) {
    this.cropForm.get('crop')!.setValue(crop.crop);
    this.cropForm.get('status')!.setValue(crop.status);
    this.cropForm.get('cropId')!.setValue(crop.cropId);
  }
  getCrops() {
    this.crops.loading = true;
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

  createCrop() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.cropService
      .postCrop({
        crop: this.cropForm.get('crop')?.value,
        deleted: false,
        icon: 'no icon',
        organisationId: 1,
        status: this.cropForm.get('status')?.value,
      })
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create Crop',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('create resp', resp);
          this.resetForm();
          this.getCrops();
        },
        (err) => {
          console.log('crop err', err);
          this.alertWithError();
        }
      );
  }
  updateCrop() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.cropService
      .updateCrop(
        {
          crop: this.cropForm.get('crop')?.value,
          cropId: this.cropForm.get('cropId')!.value,
          deleted: false,
          icon: 'no icon',
          organisationId: 1,
          status: this.cropForm.get('status')?.value,
          recordVersion: this.currentCrop?.recordVersion,
        },
        this.cropForm.get('cropId')!.value
      )
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create Crop',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('create resp', resp);
          this.resetForm();
          this.getCrops();
        },
        (err) => {
          console.log('crop err', err);
          this.alertWithError();
        }
      );
  }

  deleteCrop() {
    const cId = this.currentCrop!.cropId;
    if (!cId) {
      return;
    }
    this.cropService.deleteCrop(cId).subscribe(
      (resp) => {
        Swal.fire('Deleted!', 'Crop successfully deleted', 'success');
        this.getCrops();
      },
      (err) => {
        console.log('crop err', err);
        this.alertWithError();
      }
    );
  }

  resetForm() {
    this.cropForm.reset();
    this.cropForm.markAsPristine();
    this.modalBtn = {
      loading: false,
      text: 'Create Crop',
      classes: 'btn btn-primary',
    };
  }

  handleSubmit() {
    if (this.cropForm.invalid) {
      console.log('invalid');
      this.formSubmitted = true;
      return;
    }

    this.formSubmitted = false;
    if (this.cropForm.get('cropId')?.value) {
      this.updateCrop();
    } else {
      this.createCrop();
    }
  }

  alertWithSuccess() {
    Swal.fire('Thank you...', 'You submitted succesfully!', 'success');
  }
  alertWithError() {
    Swal.fire('Error Occurred!', 'Try again later!', 'error');
  }

  confirmBox(crop: Crop) {
    this.currentCrop = crop;
    Swal.fire({
      title: 'Are you sure want to delete crop?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.value) {
        this.deleteCrop();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your imaginary file is safe :)', 'error');
      }
    });
  }
}
