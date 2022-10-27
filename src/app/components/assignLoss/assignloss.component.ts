import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { AssignService } from 'src/app/shared/assign.service';
import { AssignModel } from './assign';

@Component({
  selector: 'app-assignloss',
  templateUrl: './assignloss.component.html',
  styleUrls: ['./assignloss.component.css']
})
export class AssignlossComponent implements OnInit {

  formValue !:FormGroup;
  assignModelObj : AssignModel = new AssignModel();
  assignData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : AssignService
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      assessor : [''],
  
    })
    this.getAllEmployee();
  }
    clickAddEmployee(){
      this.formValue.reset();
      this.showAdd = true;
      this.showUpdate = false;
    }
  
    postEmployeeDetails(){
      this.  assignModelObj.assessor= this.formValue.value.assessor;
      
      
      
      this.api.postAssign(this.  assignModelObj)
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
      this.api.getAssign()
      .subscribe(res=>{
        this.assignData = res;
      })
    }
    // deleteEmployee( row:any){
    //   this.api.deleteEmployee( row.id)
    //   .subscribe(res=>{
    //     alert("Employee Deleted")
    //     this.getAllEmployee();
    //   })
    // }
    onEdit( row:any){
      this.showAdd = false;
      this.showUpdate = true;
      this.  assignModelObj.id =  row.id;
      this.formValue.controls['assessor'].setValue( row.assessor);
      
     
     
     
    }
    updateEmployeeDetails(){
      this.  assignModelObj.assessor = this.formValue.value.assessor;
      
      
      this.api.updateAssign(this.  assignModelObj,this.  assignModelObj.id)
      .subscribe(res=>{
        alert("Updated Successfully")
        let ref = document.getElementById('cancel')
        ref?.click();
        this.formValue.reset();
        this.getAllEmployee();
      })
     
  }
}


