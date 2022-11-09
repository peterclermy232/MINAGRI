import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Role, RoleModel } from './role-name';
import Swal from 'sweetalert2';

import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
// import { roleService } from '../../shared/role.service';
import { finalize } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';
import { RoleService } from 'src/app/shared/role.service';

@Component({
  selector: 'app-badges',
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.css']
})
export class BadgesComponent implements OnInit {


  roleForm: FormGroup;
formSubmitted = false;
  currentrole: null | Role = null;
  modalMode = {
    label: 'Create role',
    typ: 'Create',
  };
  modalBtn = {
    loading: false,
    text: 'Create role',
    classes: 'btn btn-primary',
  };
  roles: {
    loading: boolean;
    data: Role[] | any[];
  } = {
    loading: false,
    data: [],
  };
  dataTable = {
    columns: [
      {
        label: 'role',
        data: 'role',
        dynamic: true,
        classes: '',
      },
      {

        classes: '',
      },
      {
        label: 'description',
        data: 'description',
        dynamic: true,
        classes: '',
      },
      {
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
  modalButton: any;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    // private roleService: roleService,
    private roleService:RoleService,
    private notifierService: NotifierService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      role: ['', [Validators.required]],
      status: [true, Validators.required],
      roleId: [''],
    });
  }
  ngOnInit(): void {
    this.getRoles();
  }

  showModal(role?: Role) {
    if (role) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit role';
      this.modalBtn = {
        text: 'Edit role',
        classes: 'btn btn-warning',
        loading: false,
      };
      this.currentrole = role;
      this.setRoleInfo(role);
    } else {
      this.modalMode.typ = 'create';
      this.modalMode.label = 'Create role';
      this.modalBtn = {
        text: 'Create role',
        classes: 'btn btn-primary',
        loading: false,
      };
      this.resetForm();
    }
  }
  setRoleInfo(role: Role) {
    this.roleForm.get('role')!.setValue(role.Role);
    this.roleForm.get('status')!.setValue(role.status);
    this.roleForm.get('roleId')!.setValue(role.roleId);
  }
  getRoles() {
    this.roles.loading = true;
    this.roleService
      .getRoles()
      .pipe(
        finalize(() => {
          this.roles.loading = false;
        })
      )
      .subscribe(
        (resp: any) => {
          const orgs = resp.orgsResponse.results;
          this.roles.data = resp.rolesResponse.map((role: any) => {
            const org = orgs.find(
              (typ: any) => typ.organisation_id === role.organisationId
            );
            return {
              ...role,
              organisation: org ? org.organisation_name : 'none',
            };
          });
        },
        (err) => {
          console.log('role err', err);
        }
      );
  }

  createRole() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.roleService
      .postRole({
        role: this.roleForm.get('role')?.value,
        deleted: false,
        icon: 'no icon',
        organisationId: 1,
        status: this.roleForm.get('status')?.value,
      })
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create role',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('create resp', resp);
          this.resetForm();
          this.getRoles();
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'role successfully created!',
            timer: true,
          });
        },
        (err) => {
          console.log('role err', err);
          const errorMessage =
            err.error.errors[0].message || 'Invalid data submitted';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }
  updateRole() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.roleService
      .updateRole(
        {
          role: this.roleForm.get('role')?.value,
          roleId: this.roleForm.get('roleId')!.value,
          deleted: false,
          icon: 'no icon',
          organisationId: 1,
          status: this.roleForm.get('status')?.value,
          recordVersion: this.currentrole?.recordVersion,
        },
        this.roleForm.get('roleId')!.value
      )
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create role',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          this.modalButton.nativeElement.click();
          this.resetForm();
          this.getRoles();
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'role successfully created!',
            timer: true,
          });
        },
        (err) => {
          console.log('role err', err);
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
    this.roleForm.reset();
    this.roleForm.markAsPristine();
    this.modalBtn = {
      loading: false,
      text: 'Create role',
      classes: 'btn btn-primary',
    };
  }

  handleSubmit() {
    if (this.roleForm.invalid) {
      console.log('invalid');
      this.formSubmitted = true;
      return;
    }

    this.formSubmitted = false;
    if (this.roleForm.get('roleId')?.value) {
      this.updateRole();
    } else {
      this.createRole();
    }
  }
}