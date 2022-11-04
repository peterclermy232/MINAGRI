import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddcropService } from 'src/app/shared/addcrop.service';
import { AddModel } from './manage-crop';
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
    console.log('ok');
  }
}
