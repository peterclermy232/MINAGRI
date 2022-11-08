import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Organization, OrganizationType } from '../../types';
import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
import { OrganizationService } from '../../app/shared/organization.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent implements OnInit {
  organizationForm: FormGroup;
  formSubmitted = false;
  currentOrg: null | Organization = null;
  modalMode = {
    label: 'Create Organization',
    typ: 'Create',
  };
  modalBtn = {
    loading: false,
    text: 'Create Organization',
    classes: 'btn btn-primary',
  };
  organizations: {
    loading: boolean;
    data: Organization[] | any[];
  } = {
    loading: false,
    data: [],
  };
  countries: { country: string; country_id: string }[] = [];
  organizationTypes: OrganizationType[] = [];
  dataTable = {
    columns: [
      {
        label: 'Organisation Code',
        data: 'organisation_code',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Organisation',
        data: 'organisation_name',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Organisation Type',
        data: 'organisation_type',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Country',
        data: 'country',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Email',
        data: 'organisation_email',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Phone',
        data: 'organisation_msisdn',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Contact Person',
        data: 'organisation_contact',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Status',
        data: 'organisation_status',
        dynamic: false,
        classes: 'text-center',
      },
      {
        label: 'Actions',
        data: 'actions',
        dynamic: false,
        classes: 'text-center',
      },
    ],
  };
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private notifierService: NotifierService,
    private fb: FormBuilder
  ) {
    this.organizationForm = this.fb.group({
      organisation_type_id: ['', [Validators.required]],
      country_id: ['', [Validators.required]],
      organisation_code: ['', [Validators.required]],
      organisation_name: ['', [Validators.required]],
      organisation_email: ['', [Validators.required]],
      organisation_msisdn: ['', [Validators.required]],
      organisation_contact: ['', [Validators.required]],
      organisation_status: ['ACTIVE', Validators.required],
      organisationId: [null],
    });
  }
  ngOnInit(): void {
    this.getOrganizations();
  }
  setOrganization(organization: Organization) {
    this.organizationForm
      .get('organisation_type_id')!
      .setValue(organization.organisation_type_id);
    this.organizationForm
      .get('organisation_code')!
      .setValue(organization.organisation_code);
    this.organizationForm
      .get('organisation_name')!
      .setValue(organization.organisation_name);
    this.organizationForm
      .get('organisation_email')!
      .setValue(organization.organisation_email);
    this.organizationForm
      .get('organisation_msisdn')!
      .setValue(organization.organisation_msisdn);
    this.organizationForm
      .get('organisation_contact')!
      .setValue(organization.organisation_contact);
    this.organizationForm.get('country_id')!.setValue(organization.country_id);
    this.organizationForm
      .get('organisation_status')!
      .setValue(organization.organisation_status);
    this.organizationForm
      .get('organisationId')!
      .setValue(organization.organisation_id);
    console.log(this.organizationForm);
    console.log(this.countries);
    console.log(this.organizationTypes);
  }
  showModal(organization?: Organization) {
    console.log('organization', organization);
    if (organization) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit Organization';
      this.modalBtn = {
        text: 'Edit Organization',
        classes: 'btn btn-warning',
        loading: false,
      };
      this.currentOrg = organization;
      this.setOrganization(organization);
    } else {
      this.modalMode.typ = 'create';
      this.modalMode.label = 'Create Organization';
      this.modalBtn = {
        text: 'Create Organization',
        classes: 'btn btn-primary',
        loading: false,
      };
      this.resetForm();
    }
  }

  getOrganizations() {
    this.organizations.loading = true;
    this.organizationService
      .getOrganizations()
      .pipe(
        finalize(() => {
          this.organizations.loading = false;
        })
      )
      .subscribe(
        (resp: any) => {
          // this.organizationTypes.data = resp;
          const orgTypes = resp.orgTypesResponse.results;
          const countriesResponse = resp.countriesResponse.results;
          this.organizationTypes = orgTypes;
          this.countries = countriesResponse;
          this.organizations.data = resp.orgsResponse.results.map(
            (organization: any) => {
              const type = orgTypes.find(
                (typ: any) =>
                  typ.organisation_type_id === organization.organisation_type_id
              );
              const country = countriesResponse.find(
                (cty: any) => cty.country_id === organization.country_id
              );
              return {
                ...organization,
                organisation_type: type ? type.organisation_type : 'none',
                country: country ? country.country : 'none',
              };
            }
          );
        },
        (err) => {
          console.log('crop err', err);
        }
      );
  }

  createOrganization() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.organizationService
      .postOrganization({
        country_id: parseInt(this.organizationForm.get('country_id')?.value),
        organisation_type_id: parseInt(
          this.organizationForm.get('organisation_type_id')?.value
        ),
        organisation_code:
          this.organizationForm.get('organisation_code')?.value,
        organisation_name:
          this.organizationForm.get('organisation_name')?.value,
        organisation_email:
          this.organizationForm.get('organisation_email')?.value,
        organisation_msisdn: this.getString(
          this.organizationForm.get('organisation_msisdn')?.value
        ),
        organisation_contact: this.organizationForm.get('organisation_contact')
          ?.value,
        organisation_status: this.organizationForm.get('organisation_status')
          ?.value,
      })
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create Organization',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('create resp', resp);
          this.resetForm();
          this.getOrganizations();
          // Swal.fire('Success!', 'Organization created successfully', 'success');
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Organization created successfully',
            timer: true,
          });
        },
        (err) => {
          console.log('er', err.error);
          const errorMessage =
            err.error.errors[0].message || 'Invalid data submitted';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }
  updateOrganization() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.organizationService
      .updateOrganization(
        {
          organisation_id: this.currentOrg?.organisation_id,
          country_id: this.organizationForm.get('organisation_type')?.value,
          organisation_type_id: this.organizationForm.get(
            'organisation_type_id'
          )?.value,
          organisation_code:
            this.organizationForm.get('organisation_code')?.value,
          organisation_name:
            this.organizationForm.get('organisation_name')?.value,
          organisation_email:
            this.organizationForm.get('organisation_email')?.value,
          organisation_msisdn: this.organizationForm.get('organisation_msisdn')
            ?.value,
          organisation_contact: this.organizationForm.get(
            'organisation_contact'
          )?.value,
          organisation_status: this.organizationForm.get('organisation_status')
            ?.value,
          record_version: this.currentOrg?.record_version,
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
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Organization updated successfully',
            timer: true,
          });
          this.resetForm();
          this.getOrganizations();
        },
        (err) => {
          console.log('org err', err);
          const errorMessage = err.error.errors[0] || 'Invalid data submitted';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }

  resetForm() {
    this.organizationForm.reset();
    this.organizationForm.markAsPristine();
    this.modalBtn = {
      loading: false,
      text: 'Create Organization',
      classes: 'btn btn-primary',
    };
  }

  handleSubmit() {
    console.log('organizationForm', this.organizationForm);
    if (this.organizationForm.invalid) {
      console.log('invalid');
      this.formSubmitted = true;
      return;
    }

    this.formSubmitted = false;
    if (this.organizationForm.get('organisationId')?.value) {
      this.updateOrganization();
    } else {
      this.createOrganization();
    }
  }

  alertWithError() {
    Swal.fire('Error Occurred!', 'Try again later!', 'error');
  }

  getString(text: number) {
    return text.toString();
  }
}
