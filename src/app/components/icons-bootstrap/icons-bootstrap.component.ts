import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { AddcropService } from 'src/app/shared/addcrop.service';
import { AddModel } from './manage-crop';

@Component({
  selector: 'app-icons-bootstrap',
  templateUrl: './icons-bootstrap.component.html',
  styleUrls: ['./icons-bootstrap.component.css']
})
export class IconsBootstrapComponent implements OnInit {

  formValue !:FormGroup;
  addModelObj : AddModel = new AddModel();
  addData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : AddcropService
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      name : [''],
      status : ['']
      //email : [''],
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
    this. addModelObj.name = this.formValue.value.name;
    this. addModelObj.status = this.formValue.value.status;
    
    this.api.postAdd(this. addModelObj)
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
    this.api.getAdd()
    .subscribe(res=>{
      this.addData = res;
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
    this. addModelObj.id = row.id;
    this.formValue.controls['name'].setValue(row.name);
    this.formValue.controls['description'].setValue(row.description);
   
  }
  updateEmployeeDetails(){
    this. addModelObj.name = this.formValue.value.name;
    this. addModelObj.status = this.formValue.value.status;
    
    this.api.updateAdd(this. addModelObj,this. addModelObj.id)
    .subscribe(res=>{
      alert("Updated Successfully")
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    })
  }

}
