import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InsuranceService } from '../shared/insurance.service';
import { InsuranceModel } from './insurance';

@Component({
  selector: 'app-insurance',
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.css']
})
export class InsuranceComponent implements OnInit {

  formValue !:FormGroup;
  insuranceModelObj : InsuranceModel = new InsuranceModel();
  insuranceData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : InsuranceService
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
      this.insuranceModelObj.id= this.formValue.value.id;
    this.insuranceModelObj.idNumber= this.formValue.value.idNumber;
    this.insuranceModelObj.farm = this.formValue.value.farm;
    this.insuranceModelObj.insurance= this.formValue.value.insurance;
    this.insuranceModelObj.planting = this.formValue.value.planting;
    this.insuranceModelObj.landSize = this.formValue.value.landSize;
    this.insuranceModelObj.measure = this.formValue.value.measure;
      
      
      
      this.api.postPolicy(this.  insuranceModelObj)
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
        this.insuranceData = res;
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
      this.insuranceModelObj.id =  row.id;
      this.formValue.controls['idNumber'].setValue( row.idNumber);
      this.formValue.controls['farm'].setValue( row.farm);
      this.formValue.controls['insurance'].setValue( row.insurance);
      this.formValue.controls['planting'].setValue( row.planting);
      this.formValue.controls['landSize'].setValue( row.landSize);
      this.formValue.controls['assessor'].setValue( row.assessor);
      this.formValue.controls['measure'].setValue( row.measure);

      
     
     
     
    }
    updateEmployeeDetails(){
    this.insuranceModelObj.idNumber= this.formValue.value.idNumber;
    this.insuranceModelObj.farm = this.formValue.value.farm;
    this.insuranceModelObj.insurance= this.formValue.value.insurance;
    this.insuranceModelObj.planting = this.formValue.value.planting;
    this.insuranceModelObj.landSize = this.formValue.value.landSize;
    this.insuranceModelObj.measure = this.formValue.value.measure;
      
      
      
       this.api.updatePolicy(this.  insuranceModelObj,this.  insuranceModelObj.id)
      .subscribe(res=>{
        alert("Updated Successfully")
        let ref = document.getElementById('cancel')
        ref?.click();
        this.formValue.reset();
        this.getAllEmployee();
      })
     
  }

}
