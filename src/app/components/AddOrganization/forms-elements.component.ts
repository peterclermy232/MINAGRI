import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/user.service';
import { UserModel } from './users';
import { Organization, OrganizationType, User } from '../../types';
import { AuthService } from '../../shared/auth.service';
import { OrganizationService } from '../../app/shared/organization.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { NotifierService } from '../../services/notifier.service';

@Component({
  selector: 'app-forms-elements',
  templateUrl: './forms-elements.component.html',
  styleUrls: ['./forms-elements.component.css'],
})
export class FormsElementsComponent implements OnInit {
  userForm: FormGroup;
  formSubmitted = false;
  currentUser: null | User = null;
  modalMode = {
    label: 'Create User',
    typ: 'Create',
  };
  modalBtn = {
    loading: false,
    text: 'Create User',
    classes: 'btn btn-primary',
  };
  users: {
    loading: boolean;
    data: User[] | any[];
  } = {
    loading: false,
    data: [],
  };
  userTypes: { type_id: string; type_name: string }[] = [];
  countries: { country: string; country_id: string }[] = [];
  organizations: Organization[] = [];
  dataTable = {
    columns: [
      {
        label: 'Name',
        data: 'user_name',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Email',
        data: 'user_email',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Phone',
        data: 'user_msisdn',
        dynamic: true,
        classes: '',
      },
      {
        label: 'User Type',
        data: 'user_type',
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
        label: 'Organisation',
        data: 'organisation',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Status',
        data: 'user_status',
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
    this.userForm = this.fb.group({
      organisation_id: ['', [Validators.required]],
      country_id: ['', [Validators.required]],
      // user_type: ['', [Validators.required]],
      user_name: ['', [Validators.required]],
      user_email: ['', [Validators.required]],
      user_msisdn: ['', [Validators.required]],
      new_password: ['', [Validators.required]],
      user_status: ['ACTIVE', Validators.required],
      userId: [null],
    });
  }
  ngOnInit(): void {
    this.getUsers();
  }
  setUser(user: User) {
    console.log('user', user);
    this.userForm.get('organisation_id')!.setValue(user.organisation_id);
    this.userForm.get('userId')!.setValue(user.user_id);
    this.userForm.get('user_name')!.setValue(user.user_name);
    this.userForm.get('user_email')!.setValue(user.user_email);
    // this.userForm.get('user_type')!.setValue(user.user_type);
    this.userForm.get('user_msisdn')!.setValue(user.user_msisdn);
    this.userForm.get('new_password')!.setValue(user.new_password);
    this.userForm.get('user_status')!.setValue(user.user_status);
    this.userForm.get('country_id')!.setValue(user.country_id);
    console.log('userform', this.userForm);
  }
  showModal(user?: User) {
    if (user) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit User';
      this.modalBtn = {
        text: 'Edit User',
        classes: 'btn btn-warning',
        loading: false,
      };
      this.currentUser = user;
      this.setUser(user);
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

  getUsers() {
    this.users.loading = true;
    this.userService
      .getUsers()
      .pipe(
        finalize(() => {
          this.users.loading = false;
        })
      )
      .subscribe(
        (resp: any) => {
          // this.organizationTypes.data = resp;
          const orgs = resp.orgsResponse.results;
          const countriesResponse = resp.countriesResponse.results;
          this.countries = countriesResponse;
          this.organizations = orgs;
          this.users.data = resp.usersResponse.results.map(
            (organization: any) => {
              const org = orgs.find(
                (typ: any) =>
                  typ.organisation_id === organization.organisation_id
              );
              const country = countriesResponse.find(
                (cty: any) => cty.country_id === organization.country_id
              );
              return {
                ...organization,
                organisation: org ? org.organisation_name : 'none',
                country: country ? country.country : 'none',
              };
            }
          );
        },
        (err) => {
          console.log('user err', err);
        }
      );
  }

  createUser() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    const initOb = this.userForm.get('new_password')!.value
      ? { new_password: this.userForm.get('new_password')!.value }
      : {};
    this.userService
      .postUser({
        ...initOb,
        organisation_id: parseInt(this.userForm.get('organisation_id')!.value),
        country_id: parseInt(this.userForm.get('country_id')!.value),
        user_type: 'API USER',
        user_name: this.userForm.get('user_name')!.value,
        user_email: this.userForm.get('user_email')!.value,
        user_msisdn: this.userForm.get('user_msisdn')!.value,
        user_status: this.userForm.get('user_status')!.value,
      })
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create User',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('create resp', resp);
          this.resetForm();
          this.getUsers();
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'User successfully created!',
            timer: true,
          });
        },
        (err) => {
          console.log('err', err);
          const errorMessage =
            err.error.errors[0].message || 'Invalid data submitted';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }
  updateUser() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    const initOb =
      this.userForm.get('new_password')!.value !== 'edited'
        ? { new_password: this.userForm.get('new_password')!.value }
        : {};
    this.userService
      .updateUser(
        {
          ...initOb,
          user_id: this.currentUser?.user_id,
          record_version: this.currentUser?.record_version,
          organisation_id: this.userForm.get('organisation_id')!.value,
          country_id: this.userForm.get('country_id')!.value,
          user_type: 'API USER',
          user_name: this.userForm.get('user_name')!.value,
          user_email: this.userForm.get('user_email')!.value,
          user_msisdn: this.userForm.get('user_msisdn')!.value,
          user_status: this.userForm.get('user_status')!.value,
        },
        1
      )
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create User',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'User successfully updated!',
            timer: true,
          });
          this.resetForm();
          this.getUsers();
        },
        (err) => {
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
    this.userForm.reset();
    this.userForm.markAsPristine();
    this.modalBtn = {
      loading: false,
      text: 'Create User',
      classes: 'btn btn-primary',
    };
  }

  handleSubmit() {
    console.log('this.userform', this.userForm);
    if (this.userForm.get('userId')?.value) {
      this.userForm.get('new_password')!.setValue('edited');
    }
    if (this.userForm.invalid) {
      console.log('invalid');
      this.formSubmitted = true;
      return;
    }

    this.formSubmitted = false;
    if (this.userForm.get('userId')?.value) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  alertWithError() {
    Swal.fire('Error Occurred!', 'Try again later!', 'error');
  }
}
