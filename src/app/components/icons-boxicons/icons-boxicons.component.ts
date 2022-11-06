import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CropService } from 'src/app/shared/crop.service';
import { Crop, CropVariety } from '../../types';
import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { NotifierService } from '../../services/notifier.service';

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
  crops: Crop[] = [];
  cropVarieties: {
    loading: boolean;
    data: Crop[] | any[];
  } = {
    loading: false,
    data: [],
  };
  dataTable = {
    columns: [
      {
        label: 'Crop Variety',
        data: 'cropVariety',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Crop',
        data: 'crop',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Organization',
        data: 'organisation',
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
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private cropService: CropService,
    private notifierService: NotifierService,
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
          // this.crops.data = resp;
          const orgs = resp.orgsResponse.results;
          const crop = resp.cropsResponse;
          console.log('cropvars resp', resp);
          this.crops = crop;
          this.cropVarieties.data = resp.cropVarResponse.map((cropVar: any) => {
            const org = orgs.find(
              (typ: any) => typ.organisation_id === cropVar.organisationId
            );
            const cr = crop.find((cp: any) => cp.cropId === cropVar.cropId);
            return {
              ...cropVar,
              crop: cr ? cr.crop : 'none',
              organisation: org ? org.organisation_name : 'none',
            };
          });
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
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Crop variety successfully created!',
            timer: true,
          });
          this.resetForm();
          this.getCropVarieties();
        },
        (err) => {
          console.log('crop err', err);
          const errorMessage =
            err.error.errors[0].message || 'Invalid data submitted';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
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
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Crop variety successfully created!',
            timer: true,
          });
          this.resetForm();
          this.getCropVarieties();
        },
        (err) => {
          console.log('crop err', err);
          const errorMessage =
            err.error.errors[0].message || 'Invalid data submitted';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
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
}
