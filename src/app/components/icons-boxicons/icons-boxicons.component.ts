import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { CropService } from 'src/app/shared/crop.service';
import { CropModel } from './crops';

@Component({
  selector: 'app-icons-boxicons',
  templateUrl: './icons-boxicons.component.html',
  styleUrls: ['./icons-boxicons.component.css']
})
export class IconsBoxiconsComponent implements OnInit {

  formValue !:FormGroup;
  cropModelObj : CropModel = new CropModel();
  cropData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : CropService
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      varietyName : [''],
      select : [''],
      status : ['']
      //description : ['']
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
    this. cropModelObj.varietyName = this.formValue.value.varietyName;
    this.cropModelObj.select = this.formValue.value.select;
    this.cropModelObj.status = this.formValue.value;
    
    this.api.postCrop(this. cropModelObj)
    .subscribe(res=>{
      console.log(res);
      alert(" Crop Added Successfully");
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
    this.api.getCrop()
    .subscribe(res=>{
      this. cropData = res;
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
    this. cropModelObj.id = row.id;
    this.formValue.controls['varietyName'].setValue(row.varietyName);
    this.formValue.controls['description'].setValue(row.select);
    this.formValue.controls['select'].setValue(row.status)
   
  }
  updateEmployeeDetails(){
    this. cropModelObj.varietyName = this.formValue.value.varietyName;
    this.cropModelObj.select = this.formValue.value.select;
    this.cropModelObj.status = this.formValue.value;
    
    
    
    this.api.updateCrop(this. cropModelObj,this. cropModelObj.id)
    .subscribe(res=>{
      alert("Updated Successfully")
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    })
  
  }

}
