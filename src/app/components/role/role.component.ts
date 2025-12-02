import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RoleService } from 'src/app/shared/role.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  formValue!: FormGroup;
  users: any[] = [];
  availableRoles: string[] = [];

  selectedUser: any = null;
  showUpdate!: boolean;

  constructor(private fb: FormBuilder, private roleService: RoleService) {}

  ngOnInit(): void {
    this.formValue = this.fb.group({
      role: ['']
    });

    this.loadAvailableRoles();
  }

  // Load roles from service (STATIC LIST)
  loadAvailableRoles() {
    this.roleService.getAvailableRoles().subscribe(res => {
      this.availableRoles = res;
    });
  }

  // Load users belonging to a role
  filterUsersByRole() {
    const role = this.formValue.value.role;

    this.roleService.getUsersByRole(role).subscribe(res => {
      this.users = res;
    });
  }

  // Populate form to update user's role
  onEdit(user: any) {
    this.selectedUser = user;
    this.showUpdate = true;
    this.formValue.controls['role'].setValue(user.user_role);
  }

  // Update user role using service
  updateUserRole() {
    const newRole = this.formValue.value.role;

    this.roleService.updateUserRole(this.selectedUser.id, newRole)
      .subscribe(res => {
        alert("Role updated successfully!");
        this.showUpdate = false;
        this.filterUsersByRole();
      });
  }
 clickAddEmployee() {
    this.showUpdate = false;
    this.formValue.reset();
  }
}
