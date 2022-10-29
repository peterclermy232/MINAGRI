import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { ApiService } from 'src/app/shared/api.service';
import { OrganizationModel } from './organization';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.css']
})
export class AccordionComponent implements OnInit {

  formValue !:FormGroup;
  organizationModelObj : OrganizationModel = new OrganizationModel();
  organizationData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : ApiService
    ) { }

  ngOnInit(): void {
   
    this.formValue = this.formbuilder.group({
      name : [''],
      description : [''],
       status : [''],
      // email : [''],
      // mobile : [''],
      // salary : ['']
    })
    this.getAllEmployee();
  }
  clickAddEmployee(){
    this.formValue.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  postEmployeeDetails(){
    this.organizationModelObj.name = this.formValue.value.name;
    this.organizationModelObj.description = this.formValue.value.description;
    this.organizationModelObj.status = this.formValue.value.status
    
    this.api.postOrganization(this.organizationModelObj)
    .subscribe(res=>{
      console.log(res);
      alert("Organization Added Successfully");
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    },
    error=>{
      alert("something went wrong");
    })
  }
  getAllEmployee(){
    this.api.getOrganization()
    .subscribe(res=>{
      this.organizationData = res;
    })
  }
  // deleteEmployee(row:any){
  //   this.api.deleteEmployee(row.id)
  //   .subscribe(res=>{
  //     alert("Employee Deleted")
  //     this.getAllEmployee();
  //   })
  // }
  onEdit(row:any){
    this.showAdd = false;
    this.showUpdate = true;
    this.organizationModelObj.id = row.id;
    this.formValue.controls['name'].setValue(row.name);
    this.formValue.controls['description'].setValue(row.description);
    this.formValue.controls['status'].setValue(row.status);
   
  }
  updateEmployeeDetails(){
    this.organizationModelObj.name = this.formValue.value.name;
    this.organizationModelObj.description = this.formValue.value.description;
    this.organizationModelObj.status = this.formValue.value.status
    
    this.api.updateOrganization(this.organizationModelObj,this.organizationModelObj.id)
    .subscribe(res=>{
      alert("Updated Successfully")
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    })
  
  }
}


