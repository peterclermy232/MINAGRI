import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/user.service';
import { UserModel } from './users';
import { Organization, OrganizationType, User } from '../../types';
import { AuthService } from '../../shared/auth.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { NotifierService } from '../../services/notifier.service';
import { OrganizationService } from 'src/app/shared/organization.service';

@Component({
  selector: 'app-add-organization',
  templateUrl: './add-organization.component.html',
  styleUrls: ['./add-organization.component.css'],
})
export class AddOrganizationComponent implements OnInit {
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

  // Filtered users for display
  filteredUsers: any[] = [];

  // Filter properties
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedOrganization: string = '';

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
      user_name: ['', [Validators.required]],
      user_email: ['', [Validators.required, Validators.email]],
      user_msisdn: ['', [Validators.required]],
      new_password: ['', [Validators.required]],
      user_status: ['ACTIVE', Validators.required],
      userId: [null],
    });
  }

  ngOnInit(): void {
    console.log('Component initialized');
    console.log('Initial state - users.data:', this.users.data);
    console.log('Initial state - filteredUsers:', this.filteredUsers);
    this.getUsers();
  }

  setUser(user: User) {
    console.log('user', user);
    this.userForm.get('organisation_id')!.setValue(user.organisation_id);
    this.userForm.get('userId')!.setValue(user.user_id);
    this.userForm.get('user_name')!.setValue(user.user_name);
    this.userForm.get('user_email')!.setValue(user.user_email);
    this.userForm.get('user_msisdn')!.setValue(user.user_msisdn);
    this.userForm.get('new_password')!.setValue('');
    this.userForm.get('user_status')!.setValue(user.user_status);
    this.userForm.get('country_id')!.setValue(user.country_id);

    // Clear password requirement for edit mode
    this.userForm.get('new_password')!.clearValidators();
    this.userForm.get('new_password')!.updateValueAndValidity();

    console.log('userform', this.userForm);
  }

  showModal(user?: User) {
    this.formSubmitted = false;

    if (user) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit User';
      this.modalBtn = {
        text: 'Update User',
        classes: 'btn btn-warning',
        loading: false,
      };
      this.currentUser = user;
      this.setUser(user);
    } else {
      this.modalMode.typ = 'create';
      this.modalMode.label = 'Create New User';
      this.modalBtn = {
        text: 'Create User',
        classes: 'btn btn-primary',
        loading: false,
      };
      this.resetForm();

      // Set password as required for new users
      this.userForm.get('new_password')!.setValidators([Validators.required]);
      this.userForm.get('new_password')!.updateValueAndValidity();
    }
  }

  getUsers() {
    this.users.loading = true;
    console.log('Fetching users...');

    this.userService
      .getUsers()
      .pipe(
        finalize(() => {
          this.users.loading = false;
          console.log('Users loading finished');
        })
      )
      .subscribe(
        (resp: any) => {
          console.log('Full response:', resp);
          console.log('Response type:', typeof resp);
          console.log('Response keys:', Object.keys(resp));

          // Check if response has the expected structure
          if (!resp.orgsResponse || !resp.countriesResponse || !resp.usersResponse) {
            console.error('Response structure is incorrect!', resp);
            console.log('Expected: { orgsResponse: {...}, countriesResponse: {...}, usersResponse: {...} }');
            console.log('Got:', resp);

            this.notifierService.showSweetAlert({
              typ: 'error',
              message: 'Invalid response structure from API',
            });
            return;
          }

          console.log('orgsResponseyyy:', resp.orgsResponse);
          console.log('countriesResponseyyy:', resp.countriesResponse);
          console.log('usersResponseyyyy:', resp.usersResponse);

          const orgs = resp.orgsResponse;
          const countriesResponse = resp.countriesResponse;
          const usersResponse = resp.usersResponse;

          console.log('Organizations:', orgs);
          console.log('Countries:', countriesResponse);
          console.log('Users:', usersResponse);

          this.countries = countriesResponse;
          this.organizations = orgs;

          this.users.data = usersResponse.map(
            (user: any) => {
              const org = orgs.find(
                (typ: any) =>
                  typ.organisation_id === user.organisation_id
              );
              const country = countriesResponse.find(
                (cty: any) => cty.country_id === user.country_id
              );
              return {
                ...user,
                organisation: org ? org.organisation_name : 'none',
                country: country ? country.country : 'none',
              };
            }
          );

          console.log('Processed users:', this.users.data);

          // Initialize filtered users
          this.filteredUsers = [...this.users.data];
          console.log('Filtered users initialized:', this.filteredUsers);
        },
        (err) => {
          console.error('Error fetching users:', err);
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: 'Failed to load users. Please try again.',
          });
        }
      );
  }

  // Filter users based on search term, status, and organization
  filterUsers() {
    this.filteredUsers = this.users.data.filter((user: any) => {
      const matchesSearch =
        !this.searchTerm ||
        user.user_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.user_email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.user_msisdn?.includes(this.searchTerm);

      const matchesStatus =
        !this.selectedStatus ||
        user.user_status === this.selectedStatus;

      const matchesOrganization =
        !this.selectedOrganization ||
        user.organisation_id === parseInt(this.selectedOrganization);

      return matchesSearch && matchesStatus && matchesOrganization;
    });
  }

  createUser() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };

    const userData = {
      organisation_id: parseInt(this.userForm.get('organisation_id')!.value),
      country_id: parseInt(this.userForm.get('country_id')!.value),
      user_type: 'API USER',
      user_name: this.userForm.get('user_name')!.value,
      user_email: this.userForm.get('user_email')!.value,
      user_msisdn: this.userForm.get('user_msisdn')!.value,
      user_status: this.userForm.get('user_status')!.value,
      new_password: this.userForm.get('new_password')!.value,
    };

    this.userService
      .createUser(userData)
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
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'User successfully created!',
            timer: true,
          });

          // Close modal
          this.closeModal();

          this.resetForm();
          this.getUsers();
        },
        (err) => {
          console.log('err', err);
          const errorMessage =
            err?.error?.errors?.[0]?.message ||
            err?.error?.message ||
            'Invalid data submitted. Please check your inputs.';
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
      text: 'Updating...',
      classes: 'btn btn-warning',
    };

    const updateData: any = {
      user_id: this.currentUser?.user_id,
      record_version: this.currentUser?.record_version,
      organisation_id: parseInt(this.userForm.get('organisation_id')!.value),
      country_id: parseInt(this.userForm.get('country_id')!.value),
      user_type: 'API USER',
      user_name: this.userForm.get('user_name')!.value,
      user_email: this.userForm.get('user_email')!.value,
      user_msisdn: this.userForm.get('user_msisdn')!.value,
      user_status: this.userForm.get('user_status')!.value,
    };

    // Only include password if it was changed
    const newPassword = this.userForm.get('new_password')!.value;
    if (newPassword && newPassword.trim() !== '') {
      updateData.new_password = newPassword;
    }

    this.userService
      .updateUser(updateData, this.currentUser?.user_id!)
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Update User',
            classes: 'btn btn-warning',
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

          // Close modal
          this.closeModal();

          this.resetForm();
          this.getUsers();
        },
        (err) => {
          console.log('err', err);
          const errorMessage =
            err?.error?.errors?.[0]?.message ||
            err?.error?.message ||
            'Failed to update user. Please try again.';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }

  deleteUser(user: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete user "${user.user_name}"? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Since in-memory-web-api supports DELETE
        this.userService.deleteUser(user.user_id).subscribe(
          (resp) => {
            this.notifierService.showSweetAlert({
              typ: 'success',
              message: 'User successfully deleted!',
              timer: true,
            });
            this.getUsers();
          },
          (err) => {
            console.log('delete err', err);
            this.notifierService.showSweetAlert({
              typ: 'error',
              message: 'Failed to delete user. Please try again.',
            });
          }
        );
      }
    });
  }

  resetForm() {
    this.userForm.reset({
      user_status: 'ACTIVE'
    });
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
    this.currentUser = null;
    this.formSubmitted = false;

    this.modalBtn = {
      loading: false,
      text: 'Create User',
      classes: 'btn btn-primary',
    };

    // Reset password validation
    this.userForm.get('new_password')!.setValidators([Validators.required]);
    this.userForm.get('new_password')!.updateValueAndValidity();
  }

  handleSubmit() {
    console.log('Form submitted', this.userForm);

    if (this.userForm.invalid) {
      console.log('Form is invalid');
      this.formSubmitted = true;

      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });

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

  // Helper method to close modal
  closeModal() {
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      const backdrop = document.querySelector('.modal-backdrop');
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }

  // Debug method - REMOVE AFTER TESTING
  debugData() {
    console.log('=== DEBUG DATA ===');
    console.log('users.loading:', this.users.loading);
    console.log('users.data:', this.users.data);
    console.log('users.data.length:', this.users.data?.length);
    console.log('filteredUsers:', this.filteredUsers);
    console.log('filteredUsers.length:', this.filteredUsers?.length);
    console.log('organizations:', this.organizations);
    console.log('countries:', this.countries);
    console.log('searchTerm:', this.searchTerm);
    console.log('selectedStatus:', this.selectedStatus);
    console.log('selectedOrganization:', this.selectedOrganization);

    alert(`
      Users Data: ${this.users.data?.length || 0}
      Filtered Users: ${this.filteredUsers?.length || 0}
      Organizations: ${this.organizations?.length || 0}
      Countries: ${this.countries?.length || 0}
    `);
  }
}
