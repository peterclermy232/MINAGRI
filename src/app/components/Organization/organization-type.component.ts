import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/shared/api.service';
import { OrganizationModel } from './organization';
import {
  Crop,
  organizationResponse,
  OrganizationType,
  OrganizationTypeResponse,
} from '../../types';
import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
import { CropService } from '../../shared/crop.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { OrganizationService } from 'src/app/shared/organization.service';


@Component({
  selector: 'app-organization-type',
  templateUrl: './organization-type.component.html',
  styleUrls: ['./organization-type.component.css'],
})
export class OrganizationTypeComponent implements OnInit {
  organizationTypeForm: FormGroup;
  formSubmitted = false;
  currentOrgType: null | OrganizationType = null;
  modalMode = {
    label: 'Create Organization Type',
    typ: 'Create',
  };
  modalBtn = {
    loading: false,
    text: 'Create Organization Type',
    classes: 'btn btn-primary',
  };
  organizationTypes: {
    loading: boolean;
    data: OrganizationType[];
  } = {
    loading: false,
    data: [],
  };
  dataTable = {
    columns: [
      {
        label: 'Organization Type',
        data: 'organization',
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
    private organizationService: OrganizationService,
    private fb: FormBuilder
  ) {
    this.organizationTypeForm = this.fb.group({
      organization_type: ['', [Validators.required]],
      status: ['ACTIVE', Validators.required],
      organizationTypeId: [null],
    });
  }
  ngOnInit(): void {
    this.getOrganizationTypes();
  }

  showModal(organizationType?: OrganizationType) {
    if (organizationType) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit Organization Type';
      this.modalBtn = {
        text: 'Edit Organization Type',
        classes: 'btn btn-warning',
        loading: false,
      };
      this.currentOrgType = organizationType;
      this.setOrganizationType(organizationType);
    } else {
      this.resetForm();
      this.organizationTypeForm.get('status')!.setValue('ACTIVE');
      this.modalMode.typ = 'create';
      this.modalMode.label = 'Create Organization Type';
      this.modalBtn = {
        text: 'Create Organization Type',
        classes: 'btn btn-primary',
        loading: false,
      };
    }
  }
  setOrganizationType(organization: OrganizationType) {
    this.organizationTypeForm
      .get('organization_type')!
      .setValue(organization.organisation_type);
    this.organizationTypeForm
      .get('status')!
      .setValue(organization.organisation_type_status);
    this.organizationTypeForm
      .get('organizationTypeId')!
      .setValue(organization.organisation_type_id);
  }
  getOrganizationTypes() {
    this.organizationTypes.loading = true;
    this.organizationService
      .getOrganizationTypes()
      .pipe(
        finalize(() => {
          this.organizationTypes.loading = false;
        })
      )
      .subscribe(
        (resp: any) => {
          this.organizationTypes.data = resp.results as OrganizationType[];
          console.log('organization types', resp);
        },
        (err) => {
          console.log('crop err', err);
        }
      );
  }

  createOrganizationType() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.organizationService
      .postOrganizationType({
        organisation_type:
          this.organizationTypeForm.get('organization_type')?.value,
        organisation_type_status:
          this.organizationTypeForm.get('status')?.value,
      })
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create Organization Type',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('create resp', resp);
          this.resetForm();
          this.getOrganizationTypes();
          Swal.fire(
            'Success!',
            'Organization type created successfully',
            'success'
          );
        },
        (err) => {
          console.log('org typ err', err);
          this.alertWithError();
        }
      );
  }
  updateOrganizationType() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.organizationService
      .updateOrganizationType(
        {
          organisation_type_id:
            this.organizationTypeForm.get('organizationTypeId')?.value,
          organisation_type:
            this.organizationTypeForm.get('organisation_type')?.value,
          record_version: this.currentOrgType?.record_version,
        },
        1
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
          this.getOrganizationTypes();
        },
        (err) => {
          console.log('crop err', err);
          this.alertWithError();
        }
      );
  }

  resetForm() {
    this.organizationTypeForm.reset();
    this.organizationTypeForm.markAsPristine();
    this.modalBtn = {
      loading: false,
      text: 'Create Organization Type',
      classes: 'btn btn-primary',
    };
  }

  handleSubmit() {
    console.log('orgtype', this.organizationTypeForm);
    if (this.organizationTypeForm.invalid) {
      console.log('invalid');
      this.formSubmitted = true;
      return;
    }

    this.formSubmitted = false;
    if (this.organizationTypeForm.get('cropId')?.value) {
      this.updateOrganizationType();
    } else {
      this.createOrganizationType();
    }
  }

  alertWithSuccess() {
    Swal.fire('Thank you...', 'You submitted succesfully!', 'success');
  }
  alertWithError() {
    Swal.fire('Error Occurred!', 'Try again later!', 'error');
  }
}
