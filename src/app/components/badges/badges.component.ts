import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { RoleService } from 'src/app/shared/role.service';
import { RoleModel } from './role-name';

@Component({
  selector: 'app-badges',
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.css']
})
export class BadgesComponent implements OnInit {

  formValue !:FormGroup;
  roleModelObj : RoleModel = new RoleModel();
  roleData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : RoleService
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      name : [''],
      description : [''],
      select : [''],
    })
    this.getAllEmployee();
  }
  clickAddEmployee(){
    this.formValue.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  postEmployeeDetails(){
    this.  roleModelObj.name = this.formValue.value.name;
    this.  roleModelObj.description = this.formValue.value. description;
   
    this. roleModelObj.select = this.formValue.value.select;
    
    this.api.postLoss(this.  roleModelObj)
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
    this.api.getLoss()
    .subscribe(res=>{
      this.roleData = res;
    })
  }
  // deleteEmployee( users:any){
  //   this.api.deleteEmployee( users.id)
  //   .subscribe(res=>{
  //     alert("Employee Deleted")
  //     this.getAllEmployee();
  //   })
  // }
  onEdit( users:any){
    this.showAdd = false;
    this.showUpdate = true;
    this.  roleModelObj.id =  users.id;
    this.formValue.controls['name'].setValue( users.organization);
    this.formValue.controls['description'].setValue( users. description);
   
    this.formValue.controls['select'].setValue( users.select)
   
  }
  updateEmployeeDetails(){
    this.  roleModelObj.name = this.formValue.value.name;
    this.  roleModelObj.description = this.formValue.value. description;
   
    this. roleModelObj.select = this.formValue.value.select;
    
    
    this.api.updateLoss(this.  roleModelObj,this.  roleModelObj.id)
    .subscribe(res=>{
      alert("Updated Successfully")
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    })
   
  }

}
