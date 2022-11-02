import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup } from '@angular/forms';

import { WrittenService } from '../shared/written.service';
import { PolicyModel } from './written';

@Component({
  selector: 'app-written',
  templateUrl: './written.component.html',
  styleUrls: ['./written.component.css']
})
export class WrittenComponent implements OnInit {

  formValue !:FormGroup;
  policyModelObj : PolicyModel = new PolicyModel();
  policyData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : WrittenService
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      idNumber : [''],
            farm : [''],
           insurance : [''],
          planting   :  [''],
        landSize     :  [''],
        measure     : ['']
    })
    this.getAllEmployee();
  }
    clickAddEmployee(){
      this.formValue.reset();
      this.showAdd = true;
      this.showUpdate = false;
    }
  
    postEmployeeDetails(){
      this.policyModelObj.idNumber= this.formValue.value.idNumber;
    this.policyModelObj.idNumber= this.formValue.value.idNumber;
    this.policyModelObj.farm = this.formValue.value.farm;
    this.policyModelObj.insurance= this.formValue.value.insurance;
    this.policyModelObj.planting = this.formValue.value.planting;
    this.policyModelObj.landSize = this.formValue.value.landSize;
    this.policyModelObj.measure = this.formValue.value.measure;
      
      
      
      this.api.postPolicy(this.  policyModelObj)
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
      this.api.getPolicy()
      .subscribe(res=>{
        this.policyData = res;
      })
    }
    // deleteEmployee( row:any){
    //   this.api.deleteEmployee( row.id)
    //   .subscribe(res=>{
    //     alert("Employee Deleted")
    //     this.getAllEmployee();
    //   })
    //}
    onEdit( row:any){
      this.showAdd = false;
      this.showUpdate = true;
      this.policyModelObj.id =  row.id;
      this.formValue.controls['idNumber'].setValue( row.idNumber);
      this.formValue.controls['farm'].setValue( row.farm);
      this.formValue.controls['insurance'].setValue( row.insurance);
      this.formValue.controls['planting'].setValue( row.planting);
      this.formValue.controls['landSize'].setValue( row.landSize);
      this.formValue.controls['assessor'].setValue( row.assessor);
      this.formValue.controls['measure'].setValue( row.measure);

      
     
     
     
    }
    updateEmployeeDetails(){
    this.policyModelObj.idNumber= this.formValue.value.idNumber;
    this.policyModelObj.farm = this.formValue.value.farm;
    this.policyModelObj.insurance= this.formValue.value.insurance;
    this.policyModelObj.planting = this.formValue.value.planting;
    this.policyModelObj.landSize = this.formValue.value.landSize;
    this.policyModelObj.measure = this.formValue.value.measure;
      
      
      
       this.api.updatePolicy(this.  policyModelObj,this.  policyModelObj.id)
      .subscribe(res=>{
        alert("Updated Successfully")
        let ref = document.getElementById('cancel')
        ref?.click();
        this.formValue.reset();
        this.getAllEmployee();
      })
     
  }

}
