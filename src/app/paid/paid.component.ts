import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup } from '@angular/forms';
import { PaidService } from '../shared/paid.service';
import { PaidModel } from './paid';

@Component({
  selector: 'app-paid',
  templateUrl: './paid.component.html',
  styleUrls: ['./paid.component.css']
})
export class PaidComponent implements OnInit {

  formValue !:FormGroup;
  paidModelObj : PaidModel = new PaidModel();
  policyData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : PaidService
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

    // postEmployeeDetails(){
    // this.paidModelObj.idNumber = this.formValue.value.idNumber;
    // this.paidModelObj.idNumber = this.formValue.value.idNumber;
    // this.paidModelObj.farm = this.formValue.value.farm;
    // this.paidModelObj.insurance= this.formValue.value.insurance;
    // this.paidModelObj.planting = this.formValue.value.planting;
    // this.paidModelObj.landSize = this.formValue.value.landSize;
    // this.paidModelObj.measure = this.formValue.value.measure;



    //   this.api.postPaid(this.paidModelObj)
    //   .subscribe(res=>{
    //     console.log(res);
    //     alert("Organization Added Successfully");
    //     let ref = document.getElementById('cancel')
    //     ref?.click();
    //     this.formValue.reset();
    //     this.getAllEmployee();
    //   },
    //   error=>{
    //     alert("something went wrong");
    //   })
    // }
    getAllEmployee(){
      this.api.getPaidQuotations()
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
      this.paidModelObj.id =  row.id;
      this.formValue.controls['idNumber'].setValue( row.idNumber);
      this.formValue.controls['farm'].setValue( row.farm);
      this.formValue.controls['insurance'].setValue( row.insurance);
      this.formValue.controls['planting'].setValue( row.planting);
      this.formValue.controls['landSize'].setValue( row.landSize);
      this.formValue.controls['assessor'].setValue( row.assessor);
      this.formValue.controls['measure'].setValue( row.measure);
    }
    updateEmployeeDetails(){
    this.paidModelObj.idNumber = this.formValue.value.idNumber;
    this.paidModelObj.farm = this.formValue.value.farm;
    this.paidModelObj.insurance= this.formValue.value.insurance;
    this.paidModelObj.planting = this.formValue.value.planting;
    this.paidModelObj.landSize = this.formValue.value.landSize;
    this.paidModelObj.measure = this.formValue.value.measure;



       this.api.updatePaidQuotation(this.paidModelObj,this.  paidModelObj.id)
      .subscribe(res=>{
        alert("Updated Successfully")
        let ref = document.getElementById('cancel')
        ref?.click();
        this.formValue.reset();
        this.getAllEmployee();
      })
  }
postEmployeeDetails(){
  
}
}
