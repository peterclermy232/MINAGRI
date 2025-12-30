import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Organization, OrganizationType } from '../../types';
import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { NotifierService } from '../../services/notifier.service';
import { OrganizationService } from 'src/app/shared/organization.service';
import { PermissionService } from 'src/app/shared/permission.service';

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

  canCreate = false;
  canUpdate = false;
  canDelete = false;
  canRead = false;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private notifierService: NotifierService,
    private fb: FormBuilder,
    private permissionService: PermissionService,
  ) {
    this.organizationForm = this.fb.group({
      organisation_type_id: ['', [Validators.required]],
      country_id: ['', [Validators.required]],
      organisation_code: ['', [Validators.required]],
      organisation_name: ['', [Validators.required]],
      organisation_email: ['', [Validators.required, Validators.email]],
      organisation_msisdn: ['', [Validators.required]],
      organisation_contact: ['', [Validators.required]],
      organisation_status: ['ACTIVE', Validators.required],
      organisationId: [null],
    });
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.getOrganizations();
  }

  private loadPermissions(): void {
    this.canCreate = this.permissionService.canCreate('products');
    this.canUpdate = this.permissionService.canUpdate('products');
    this.canDelete = this.permissionService.canDelete('products');
    this.canRead = this.permissionService.canRead('products');

    console.log('Product permissions:', {
      canCreate: this.canCreate,
      canUpdate: this.canUpdate,
      canDelete: this.canDelete,
      canRead: this.canRead
    });
  }

  setOrganization(organization: Organization) {
    this.organizationForm.patchValue({
      organisation_type_id: organization.organisation_type_id,
      organisation_code: organization.organisation_code,
      organisation_name: organization.organisation_name,
      organisation_email: organization.organisation_email,
      organisation_msisdn: organization.organisation_msisdn,
      organisation_contact: organization.organisation_contact,
      country_id: organization.country_id,
      organisation_status: organization.organisation_status,
      organisationId: organization.organisation_id,
    });
  }

  showModal(organization?: Organization) {
    if (organization) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit Organization';
      this.modalBtn = {
        text: 'Update Organization',
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
    this.formSubmitted = false;
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
          const orgTypes = resp.orgTypesResponse.results;
          const countriesResponse = resp.countriesResponse.results;
          this.organizationTypes = orgTypes;
          this.countries = countriesResponse;

          // Map organizations with their type and country names
          this.organizations.data = resp.orgsResponse.results.map(
            (organization: any) => {
              const orgType = orgTypes.find(
                (typ: any) =>
                  typ.organisation_type_id === organization.organisation_type_id
              );
              const country = countriesResponse.find(
                (cty: any) => cty.country_id === organization.country_id
              );
              return {
                ...organization,
                organisation_type: orgType ? orgType.organisation_type : 'N/A',
                country: country ? country.country : 'N/A',
              };
            }
          );

          console.log('Organizations loaded:', this.organizations.data);
        },
        (err) => {
          console.error('Error loading organizations:', err);
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: 'Failed to load organizations',
          });
        }
      );
  }

  createOrganization() {
    this.modalBtn = {
      loading: true,
      text: 'Creating...',
      classes: 'btn btn-primary',
    };

    const countryId = this.organizationForm.get('country_id')?.value;
    const orgTypeId = this.organizationForm.get('organisation_type_id')?.value;

    console.log('Country ID:', countryId);
    console.log('Org Type ID:', orgTypeId);

    // Prepare payload - Django expects only the _id fields for ForeignKeys
    const payload: any = {
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
    };

    // Add ForeignKey fields - Django expects integer IDs only
    if (countryId && countryId !== '') {
      payload.country = parseInt(countryId);  // Just the ID, not in array
    }

    if (orgTypeId && orgTypeId !== '') {
      payload.organisation_type = parseInt(orgTypeId);  // Just the ID, not in array
    }

    console.log('Final Payload:', payload);

    this.organizationService
      .postOrganization(payload)
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
          console.log('Organization created:', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Organization created successfully',
            timer: true,
          });
          this.closeModal();
          this.resetForm();
          this.getOrganizations();
        },
        (err) => {
          console.error('Create organization error:', err);
          const errorMessage = this.extractErrorMessage(err);
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
      text: 'Updating...',
      classes: 'btn btn-warning',
    };

    const countryId = this.organizationForm.get('country_id')?.value;
    const orgTypeId = this.organizationForm.get('organisation_type_id')?.value;

    // Find the selected country and organization type names
    const selectedCountry = this.countries.find(c => c.country_id === countryId);
    const selectedOrgType = this.organizationTypes.find(o => o.organisation_type_id === orgTypeId);

    // Prepare payload with both ID and value fields
    const payload: any = {
      organisation_id: this.currentOrg?.organisation_id,
      organisation_code:
        this.organizationForm.get('organisation_code')?.value,
      organisation_name:
        this.organizationForm.get('organisation_name')?.value,
      organisation_email:
        this.organizationForm.get('organisation_email')?.value,
      organisation_msisdn: this.getString(
        this.organizationForm.get('organisation_msisdn')?.value
      ),
      organisation_contact: this.organizationForm.get(
        'organisation_contact'
      )?.value,
      organisation_status: this.organizationForm.get('organisation_status')
        ?.value,
      record_version: this.currentOrg?.record_version,
    };

    // Add country fields (ID as integer, country as array of string)
    if (countryId && countryId !== '' && selectedCountry) {
      payload.country_id = parseInt(countryId);
      payload.country = [selectedCountry.country]; // Array with country name
    }

    // Add organisation_type fields (ID as integer, organisation_type as array of string)
    if (orgTypeId && orgTypeId !== '' && selectedOrgType) {
      payload.organisation_type_id = parseInt(orgTypeId);
      payload.organisation_type = [selectedOrgType.organisation_type]; // Array with org type name
    }

    this.organizationService
      .updateOrganization(
        payload,
        this.currentOrg?.organisation_id || 0
      )
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Update Organization',
            classes: 'btn btn-warning',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('Organization updated:', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Organization updated successfully',
            timer: true,
          });
          this.closeModal();
          this.resetForm();
          this.getOrganizations();
        },
        (err) => {
          console.error('Update organization error:', err);
          const errorMessage = this.extractErrorMessage(err);
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }

  resetForm() {
    this.organizationForm.reset({
      organisation_status: 'ACTIVE',
      organisationId: null,
    });
    this.organizationForm.markAsPristine();
    this.organizationForm.markAsUntouched();
    this.formSubmitted = false;
    this.currentOrg = null;
  }

  closeModal() {
    // Close the Bootstrap modal programmatically
    const modalElement = document.getElementById('exampleModal');
    const modal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
    if (modal) {
      modal.hide();
    } else {
      // Fallback: click the close button
      document.getElementById('cancel')?.click();
    }
  }

  handleSubmit() {
    console.log('Form values:', this.organizationForm.value);
    console.log('Form valid:', this.organizationForm.valid);
    console.log('Form errors:', this.getFormValidationErrors());

    if (this.organizationForm.invalid) {
      this.formSubmitted = true;
      this.notifierService.showSweetAlert({
        typ: 'error',
        message: 'Please fill all required fields correctly',
      });
      return;
    }

    this.formSubmitted = false;

    if (this.organizationForm.get('organisationId')?.value) {
      this.updateOrganization();
    } else {
      this.createOrganization();
    }
  }

  // Helper method to log form validation errors
  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.organizationForm.controls).forEach(key => {
      const controlErrors = this.organizationForm.get(key)?.errors;
      if (controlErrors != null) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  alertWithError() {
    Swal.fire('Error Occurred!', 'Try again later!', 'error');
  }

  getString(text: any): string {
    if (text === null || text === undefined) return '';
    return text.toString();
  }

  // Extract error messages from backend response
  extractErrorMessage(err: any): string {
    if (!err.error) {
      return 'An unexpected error occurred';
    }

    // Handle field-specific errors like { "country": ["This field is required."] }
    if (typeof err.error === 'object' && !err.error.errors) {
      const errorFields: string[] = [];

      // Map of backend field names to user-friendly names
      const fieldMap: { [key: string]: string } = {
        'country': 'Country',
        'organisation_type': 'Organization Type',
        'organisation_code': 'Organization Code',
        'organisation_name': 'Organization Name',
        'organisation_email': 'Organization Email',
        'organisation_msisdn': 'Organization Phone',
        'organisation_contact': 'Contact Person',
        'organisation_status': 'Status'
      };

      for (const field in err.error) {
        if (err.error.hasOwnProperty(field)) {
          const fieldName = fieldMap[field] || field;
          const fieldErrors = err.error[field];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            errorFields.push(`${fieldName}: ${fieldErrors[0]}`);
          }
        }
      }

      if (errorFields.length > 0) {
        return errorFields.join('\n');
      }
    }

    // Handle errors array format like { "errors": [{ "message": "..." }] }
    if (err.error.errors && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
      return err.error.errors[0].message || 'Invalid data submitted';
    }

    // Fallback to generic message
    return err.error.message || 'Invalid data submitted';
  }
}
