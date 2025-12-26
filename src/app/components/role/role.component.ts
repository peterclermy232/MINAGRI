import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService, RoleType } from 'src/app/shared/role.service';
import { NotifierService } from 'src/app/services/notifier.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  roleForm: FormGroup;
  formSubmitted = false;

  roles: RoleType[] = [];
  filteredRoles: RoleType[] = [];

  selectedRole: RoleType | null = null;
  isEditMode = false;
  isLoading = false;
  searchText = '';
  selectedStatusFilter = '';

  modalBtn = {
    loading: false,
    text: 'Create Role',
  };

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private notifierService: NotifierService
  ) {
    this.roleForm = this.fb.group({
      role_name: ['', [Validators.required, Validators.minLength(2)]],
      role_description: [''],
      role_status: ['ACTIVE', Validators.required],
      organisation: [1, Validators.required] // Default organisation ID
    });
  }

  ngOnInit(): void {
    console.log('Role Component Initialized');
    this.loadAllRoles();
  }

  loadAllRoles() {
    console.log('Loading all roles...');
    this.isLoading = true;

    this.roleService.getAllRoles()
      .pipe(finalize(() => {
        console.log('Finished loading roles');
        this.isLoading = false;
      }))
      .subscribe(
        (res: any) => {
          console.log('Roles loaded:', res);
          this.roles = res.results || res;
          this.filteredRoles = [...this.roles];
          console.log('Roles:', this.roles);

          if (this.roles.length === 0) {
            console.warn('No roles found!');
            this.notifierService.showSweetAlert({
              typ: 'info',
              message: 'No roles found in the system'
            });
          }
        },
        (err) => {
          console.error('Error loading roles:', err);
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: 'Failed to load roles: ' + (err.error?.detail || err.message || 'Unknown error')
          });
        }
      );
  }

  filterRolesByStatus() {
    console.log('Filtering by status:', this.selectedStatusFilter);
    if (!this.selectedStatusFilter) {
      this.filteredRoles = [...this.roles];
      return;
    }

    this.filteredRoles = this.roles.filter(
      role => role.role_status === this.selectedStatusFilter
    );
    console.log('Filtered roles:', this.filteredRoles);
  }

  onSearch() {
    console.log('Searching with text:', this.searchText, 'and status:', this.selectedStatusFilter);
    let filtered = [...this.roles];

    // Filter by status if selected
    if (this.selectedStatusFilter) {
      filtered = filtered.filter(role => role.role_status === this.selectedStatusFilter);
    }

    // Filter by search text
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(role =>
        role.role_name?.toLowerCase().includes(search) ||
        role.role_description?.toLowerCase().includes(search) ||
        role.organisation_name?.toLowerCase().includes(search)
      );
    }

    this.filteredRoles = filtered;
    console.log('Search results:', this.filteredRoles.length, 'roles found');
  }

  showAddModal() {
    console.log('Opening add role modal');
    this.isEditMode = false;
    this.selectedRole = null;
    this.formSubmitted = false;
    this.modalBtn.text = 'Create Role';

    this.roleForm.reset({
      role_status: 'ACTIVE',
      organisation: 1
    });
  }

  showEditModal(role: RoleType) {
    console.log('Editing role:', role);
    this.isEditMode = true;
    this.selectedRole = role;
    this.formSubmitted = false;
    this.modalBtn.text = 'Update Role';

    this.roleForm.patchValue({
      role_name: role.role_name,
      role_description: role.role_description,
      role_status: role.role_status,
      organisation: role.organisation
    });

    console.log('Form values after patch:', this.roleForm.value);
  }

  handleSubmit() {
    console.log('Form submitted');
    this.formSubmitted = true;

    if (this.roleForm.invalid) {
      console.log('Form is invalid:', this.roleForm.errors);
      this.notifierService.showSweetAlert({
        typ: 'error',
        message: 'Please fill all required fields correctly'
      });
      return;
    }

    console.log('Form is valid, proceeding with', this.isEditMode ? 'update' : 'create');

    if (this.isEditMode) {
      this.updateRole();
    } else {
      this.createRole();
    }
  }

  createRole() {
    console.log('Creating new role');

    this.modalBtn.loading = true;
    this.modalBtn.text = 'Creating...';

    const payload = this.roleForm.value;
    console.log('Create payload:', payload);

    this.roleService.createRole(payload)
      .pipe(
        finalize(() => {
          this.modalBtn.loading = false;
          this.modalBtn.text = 'Create Role';
        })
      )
      .subscribe(
        (resp) => {
          console.log('Create response:', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Role created successfully!',
            timer: true
          });
          this.closeModal();
          this.loadAllRoles();
        },
        (err) => {
          console.error('Create error:', err);
          const errorMessage = err.error?.role_name?.[0] || err.error?.detail || err.message || 'Failed to create role';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage
          });
        }
      );
  }

  updateRole() {
    if (!this.selectedRole) {
      console.error('No role selected!');
      return;
    }

    console.log('Updating role ID:', this.selectedRole.role_id);

    this.modalBtn.loading = true;
    this.modalBtn.text = 'Updating...';

    const payload = this.roleForm.value;
    console.log('Update payload:', payload);

    this.roleService.updateRole(this.selectedRole.role_id!, payload)
      .pipe(
        finalize(() => {
          this.modalBtn.loading = false;
          this.modalBtn.text = 'Update Role';
        })
      )
      .subscribe(
        (resp) => {
          console.log('Update response:', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Role updated successfully!',
            timer: true
          });
          this.closeModal();
          this.loadAllRoles();
        },
        (err) => {
          console.error('Update error:', err);
          const errorMessage = err.error?.detail || err.message || 'Failed to update role';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage
          });
        }
      );
  }

  deleteRole(role: RoleType) {
    console.log('Deleting role:', role);

    if (role.is_system_role) {
      this.notifierService.showSweetAlert({
        typ: 'warning',
        message: 'System roles cannot be deleted'
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete role "${role.role_name}"?`)) {
      return;
    }

    this.roleService.deleteRole(role.role_id!)
      .subscribe(
        (resp) => {
          console.log('Delete response:', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Role deleted successfully!',
            timer: true
          });
          this.loadAllRoles();
        },
        (err) => {
          console.error('Delete error:', err);
          const errorMessage = err.error?.error || err.error?.detail || 'Failed to delete role';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage
          });
        }
      );
  }

  activateRole(role: RoleType) {
    console.log('Activating role:', role);

    this.roleService.activateRole(role.role_id!)
      .subscribe(
        (resp) => {
          console.log('Activate response:', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Role activated successfully!',
            timer: true
          });
          this.loadAllRoles();
        },
        (err) => {
          console.error('Activate error:', err);
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: 'Failed to activate role'
          });
        }
      );
  }

  deactivateRole(role: RoleType) {
    console.log('Deactivating role:', role);

    if (role.is_system_role) {
      this.notifierService.showSweetAlert({
        typ: 'warning',
        message: 'System roles cannot be deactivated'
      });
      return;
    }

    this.roleService.deactivateRole(role.role_id!)
      .subscribe(
        (resp) => {
          console.log('Deactivate response:', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Role deactivated successfully!',
            timer: true
          });
          this.loadAllRoles();
        },
        (err) => {
          console.error('Deactivate error:', err);
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: 'Failed to deactivate role'
          });
        }
      );
  }

  viewRoleUsers(role: RoleType) {
    console.log('Viewing users for role:', role);

    this.roleService.getRoleUsers(role.role_id!)
      .subscribe(
        (resp) => {
          console.log('Role users:', resp);
          // You can display this in a modal or navigate to a different page
          this.notifierService.showSweetAlert({
            typ: 'info',
            message: `${resp.count} user(s) assigned to this role`
          });
        },
        (err) => {
          console.error('Error fetching users:', err);
        }
      );
  }

  closeModal() {
    this.roleForm.reset({ role_status: 'ACTIVE', organisation: 1 });
    this.formSubmitted = false;
    this.isEditMode = false;
    this.selectedRole = null;

    const modalElement = document.getElementById('roleModal');
    const modal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
    modal?.hide();
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ACTIVE' ? 'bg-success' : 'bg-danger';
  }

  get f() {
    return this.roleForm.controls;
  }
}
