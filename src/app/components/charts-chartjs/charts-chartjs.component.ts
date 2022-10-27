import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { LossService } from 'src/app/shared/loss.service';
import { LossModel } from './loss';

@Component({
  selector: 'app-charts-chartjs',
  templateUrl: './charts-chartjs.component.html',
  styleUrls: ['./charts-chartjs.component.css']
})
export class ChartsChartjsComponent implements OnInit {

  
  formValue !:FormGroup;
  lossModelObj : LossModel = new LossModel();
  lossData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder: FormBuilder,
    private api : LossService) { }

  ngOnInit(): void {

    this.formValue = this.formbuilder.group({
      organization : [''],
      user : [''],
      practiceNumber : [''],
     status : ['']
    })
    this.getAllEmployee();
  }
  clickAddEmployee(){
    this.formValue.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  postEmployeeDetails(){
    this. lossModelObj.organization = this.formValue.value.organization;
    this. lossModelObj.user = this.formValue.value. user;
    this.lossModelObj.practiceNumber = this.formValue.value.practiceNumber;
    this.lossModelObj.status = this.formValue.value.status;
    
    this.api.postLoss(this. lossModelObj)
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
      this.lossData = res;
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
    this. lossModelObj.id =  users.id;
    this.formValue.controls['organization'].setValue( users.organization);
    this.formValue.controls[' user'].setValue( users. user);
    this.formValue.controls['practiceNumber'].setValue( users.practiceNumber)
    this.formValue.controls['status'].setValue( users.status)
   
  }
  updateEmployeeDetails(){
    this. lossModelObj.organization = this.formValue.value.organization;
    this. lossModelObj. user = this.formValue.value. user;
    this.lossModelObj.practiceNumber = this.formValue.value.practiceNumber;
    this.lossModelObj.status = this.formValue.value.status;
    
    this.api.updateLoss(this. lossModelObj,this. lossModelObj.id)
    .subscribe(res=>{
      alert("Updated Successfully")
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    })
   
  }
}
