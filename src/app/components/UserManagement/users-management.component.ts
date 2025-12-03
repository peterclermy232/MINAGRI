import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/shared/user.service';
import { UserModel } from './users';
import { Organization, User } from '../../types';
import { AuthService } from '../../shared/auth.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { NotifierService } from '../../services/notifier.service';
import { OrganizationService } from 'src/app/shared/organization.service';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css'],
})
export class UsersManagementComponent implements OnInit {
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
        data: 'user_phone_number',
        dynamic: true,
        classes: '',
      },
      {
        label: 'User Role',
        data: 'user_role',
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
        data: 'organisation_name',
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
      organisation: ['', [Validators.required]],
      country: [''],
      user_name: ['', [Validators.required]],
      user_email: ['', [Validators.required, Validators.email]],
      user_phone_number: [''],
      password: ['', [Validators.required]],
      user_status: ['ACTIVE', Validators.required],
      userId: [null],
    });
  }

  ngOnInit(): void {
    console.log('Component initialized');
    this.getUsers();
  }

  setUser(user: any) {
    console.log('Setting user:', user);
    this.userForm.patchValue({
      organisation: user.organisation,
      userId: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      user_phone_number: user.user_phone_number || '',
      password: '',
      user_status: user.user_status,
      country: user.country || ''
    });

    // Clear password requirement for edit mode
    this.userForm.get('password')!.clearValidators();
    this.userForm.get('password')!.updateValueAndValidity();
  }

  showModal(user?: any) {
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
      this.userForm.get('password')!.setValidators([Validators.required]);
      this.userForm.get('password')!.updateValueAndValidity();
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

          const orgs = resp.orgsResponse || [];
          const countriesResponse = resp.countriesResponse || [];
          const usersResponse = resp.usersResponse || [];

          console.log('Organizations:', orgs);
          console.log('Countries:', countriesResponse);
          console.log('Users:', usersResponse);

          this.countries = countriesResponse;
          this.organizations = orgs;

          // Map users with organization and country names
          this.users.data = usersResponse.map((user: any) => {
            const org = orgs.find(
              (o: any) => o.organisation_id === user.organisation
            );
            const country = countriesResponse.find(
              (c: any) => c.country_id === user.country
            );
            return {
              ...user,
              organisation_name: org ? org.organisation_name : user.organisation_name || 'N/A',
              country_name: country ? country.country : 'N/A',
            };
          });

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
        user.user_phone_number?.includes(this.searchTerm);

      const matchesStatus =
        !this.selectedStatus ||
        user.user_status === this.selectedStatus;

      const matchesOrganization =
        !this.selectedOrganization ||
        user.organisation === parseInt(this.selectedOrganization);

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
      organisation: parseInt(this.userForm.get('organisation')!.value),
      country: this.userForm.get('country')!.value ? parseInt(this.userForm.get('country')!.value) : null,
      user_role: 'SUPERUSER',
      user_name: this.userForm.get('user_name')!.value,
      user_email: this.userForm.get('user_email')!.value,
      user_phone_number: this.userForm.get('user_phone_number')!.value || null,
      user_status: this.userForm.get('user_status')!.value,
      password: this.userForm.get('password')!.value,
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
      organisation: parseInt(this.userForm.get('organisation')!.value),
      country: this.userForm.get('country')!.value ? parseInt(this.userForm.get('country')!.value) : null,
      //user_role: this.currentUser?.user_role || 'SUPERUSER',
      user_name: this.userForm.get('user_name')!.value,
      user_email: this.userForm.get('user_email')!.value,
      user_phone_number: this.userForm.get('user_phone_number')!.value || null,
      user_status: this.userForm.get('user_status')!.value,
    };

    // Only include password if it was changed
    const newPassword = this.userForm.get('password')!.value;
    if (newPassword && newPassword.trim() !== '') {
      updateData.password = newPassword;
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
    this.userForm.get('password')!.setValidators([Validators.required]);
    this.userForm.get('password')!.updateValueAndValidity();
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
}
