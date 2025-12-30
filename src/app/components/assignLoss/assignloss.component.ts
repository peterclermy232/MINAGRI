import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssignService } from 'src/app/shared/assign.service';
import { AssignModel } from './assign';
import { PermissionService } from 'src/app/shared/permission.service';

@Component({
  selector: 'app-assignloss',
  templateUrl: './assignloss.component.html',
  styleUrls: ['./assignloss.component.css']
})
export class AssignlossComponent implements OnInit {

  formValue!: FormGroup;
  assignModelObj: AssignModel = new AssignModel();
  assignData: any;
  showAdd!: boolean;
  showUpdate!: boolean;

  // ⭐ ADD THIS
  isLoading: boolean = false;

  assessorOptions = ["Accredit", "Blacklisted", "Disable"];
searchTerm: string = '';
filteredData: any[] = [];
  canCreate = false;
  canUpdate = false;
  canDelete = false;
  canRead = false;
  constructor(
    private formbuilder: FormBuilder,
    private api: AssignService,
    private permissionService: PermissionService,
  ) {}

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      assessor: ['', Validators.required],
    });
    this.loadPermissions();
    this.getAllEmployee();
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

  clickAddEmployee() {
    this.formValue.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  postEmployeeDetails() {
    this.isLoading = true;

    this.assignModelObj.assessor = this.formValue.value.assessor;

    this.api.postAssign(this.assignModelObj).subscribe(
      res => {
        alert("Organization Added Successfully");
        document.getElementById('cancel')?.click();
        this.formValue.reset();
        this.getAllEmployee();
        this.isLoading = false;
      },
      error => {
        alert("Something went wrong");
        this.isLoading = false;
      }
    );
  }

  getAllEmployee() {
  this.isLoading = true;

  this.api.getAssign().subscribe(
    res => {
      this.assignData = res;
      this.filteredData = res; // initialize table data
      this.isLoading = false;
    },
    err => {
      this.isLoading = false;
    }
  );
}


  onEdit(row: any) {
    this.showAdd = false;
    this.showUpdate = true;

    this.assignModelObj.id = row.id;
    this.formValue.controls['assessor'].setValue(row.assessor);
  }

  updateEmployeeDetails() {
    this.isLoading = true;

    this.assignModelObj.assessor = this.formValue.value.assessor;

    this.api.updateAssign(this.assignModelObj, this.assignModelObj.id).subscribe(
      res => {
        alert("Updated Successfully");
        document.getElementById('cancel')?.click();
        this.formValue.reset();
        this.getAllEmployee();
        this.isLoading = false;
      },
      error => {
        alert("Update failed");
        this.isLoading = false;
      }
    );
  }

  // Helper for validation
  hasError(control: string, error: string) {
    return this.formValue.get(control)?.hasError(error) &&
           this.formValue.get(control)?.touched;
  }
  onSearch(event: any) {
  const value = event.target.value.toLowerCase();
  this.searchTerm = value;

  this.filteredData = this.assignData.filter((item: any) =>
    item.id.toString().includes(value) ||
    item.assessor.toLowerCase().includes(value)
  );
}
exportToCSV(){
  const headers = ['ID', 'Assessor'];
  const rows = this.filteredData.map((item: any) => [item.id, item.assessor]);

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += headers.join(',') + '\n';
  rows.forEach(rowArray => {
    const row = rowArray.join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'assign_loss_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
}
