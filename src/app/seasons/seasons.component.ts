import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeasonsService } from '../shared/seasons.service';
import { SeasonModel } from './season';

@Component({
  selector: 'app-seasons',
  templateUrl: './seasons.component.html',
  styleUrls: ['./seasons.component.css']
})
export class SeasonsComponent implements OnInit {

  formValue !:FormGroup;
  roleModelObj : SeasonModel = new SeasonModel();
  roleData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : SeasonsService
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      name : [''],
      date: [''],
      end : [''],
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
    this.  roleModelObj.date= this.formValue.value. date;
    this.  roleModelObj.end= this.formValue.value. end;
   
    this. roleModelObj.select = this.formValue.value.select;
    
    this.api.postSeasons(this.  roleModelObj)
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
    this.api.getSeasons()
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
    this.formValue.controls['date'].setValue( users. date);
    this.formValue.controls['end'].setValue(users.end);
   
    this.formValue.controls['select'].setValue( users.select)
   
  }
  updateEmployeeDetails(){
    this.  roleModelObj.name = this.formValue.value.name;
    this.  roleModelObj.date= this.formValue.value. date;
    this.  roleModelObj.end= this.formValue.value. end;
   
    this. roleModelObj.select = this.formValue.value.select;
    
    
    this.api.updateSeasons(this.  roleModelObj,this.  roleModelObj.id)
    .subscribe(res=>{
      alert("Updated Successfully")
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    })
   
  }

}
