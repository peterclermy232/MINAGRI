import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { FarmerService } from 'src/app/shared/farmer.service';
import { FarmerModel } from './farmer';

@Component({
  selector: 'app-manage-farmer',
  templateUrl: './manage-farmer.component.html',
  styleUrls: ['./manage-farmer.component.css']
})
export class ManageFarmerComponent implements OnInit {

 
  formValue !:FormGroup;
  farmerModelObj : FarmerModel = new FarmerModel();
  farmerData !: any;
  showAdd!: boolean;
  showUpdate!:boolean;
  
  constructor(private formbuilder:FormBuilder,
    private api : FarmerService
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      name : [''],
      firstName : [''],
      lastName : [''],
      physicalAddress : [''],
      idNumber : [''],
      category : [''],
       date : [''],
       upi : [''],
       farmName : [''],
       farmSize : [''],
      bankName : [''],
      accountNumber : [''],
      emailAddres : [''],
      phoneNumber : [''],
      relationship : ['']
    })
    this.getAllEmployee();
  }
  clickAddEmployee(){
    this.formValue.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  postEmployeeDetails(){
    this. farmerModelObj.name = this.formValue.value.name;
    this. farmerModelObj. firstName = this.formValue.value. firstName;
    this. farmerModelObj. lastName = this.formValue.value. lastName;
    this. farmerModelObj. physicalAddress = this.formValue.value. physicalAddress;
    this. farmerModelObj. idNumber = this.formValue.value. idNumber;
    this. farmerModelObj. category = this.formValue.value. category;
    this. farmerModelObj. date = this.formValue.value. date;
    this. farmerModelObj. upi = this.formValue.value. upi;
    this. farmerModelObj. farmName  = this.formValue.value. farmName ;
    this. farmerModelObj. farmSize = this.formValue.value. farmSize;
    this. farmerModelObj. bankName = this.formValue.value. bankName;
    this. farmerModelObj. accountNumber = this.formValue.value. accountNumber;
    this. farmerModelObj. emailAddres = this.formValue.value. emailAddres;
    this. farmerModelObj. phoneNumber = this.formValue.value. phoneNumber;
    this. farmerModelObj. relationship = this.formValue.value. relationship;
    
    this.api.postFarmer(this.farmerModelObj)
    .subscribe(res=>{
      console.log(res);
      alert(" farmer Added Successfully");
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
    this.api.getFarmer()
    .subscribe(res=>{
      this. farmerData = res;
    })
  }
  // deleteEmployee( column:any){
  //   this.api.deleteEmployee( column.id)
  //   .subscribe(res=>{
  //     alert("Employee Deleted")
  //     this.getAllEmployee();
  //   })
  // }
  onEdit( column:any){
    this.showAdd = false;
    this.showUpdate = true;
    this. farmerModelObj.id =  column.id;
    this.formValue.controls['name'].setValue( column.name);
    this.formValue.controls[' firstName'].setValue( column. firstName);
    this.formValue.controls[' lastName'].setValue( column. firstName);
    this.formValue.controls[' physicalAddress'].setValue( column. physicalAddress);
    this.formValue.controls[' idNumber'].setValue( column. idNumber);
    this.formValue.controls[' category'].setValue( column. category);
    this.formValue.controls[' date'].setValue( column. date);
    this.formValue.controls[' upi'].setValue( column. upi);
    this.formValue.controls[' farmName'].setValue( column. farmName);
    this.formValue.controls[' farmSize'].setValue( column. farmSize);
    this.formValue.controls[' bankName'].setValue( column. bankName);
    this.formValue.controls[' accountNumber'].setValue( column. accountNumber);
    this.formValue.controls[' emailAddres'].setValue( column. emailAddres);
    this.formValue.controls[' phoneNumber'].setValue( column. phoneNumber);
    this.formValue.controls[' relationship'].setValue( column. relationship);
   
  }
  updateEmployeeDetails(){
    this. farmerModelObj.name = this.formValue.value.name;
    this. farmerModelObj. firstName = this.formValue.value. firstName;
    this. farmerModelObj. lastName = this.formValue.value. lastName;
    this. farmerModelObj. physicalAddress = this.formValue.value. physicalAddress;
    this. farmerModelObj. idNumber = this.formValue.value. idNumber;
    this. farmerModelObj. category = this.formValue.value. category;
    this. farmerModelObj. date = this.formValue.value. date;
    this. farmerModelObj. upi = this.formValue.value. upi;
    this. farmerModelObj. farmName  = this.formValue.value. farmName ;
    this. farmerModelObj. farmSize = this.formValue.value. farmSize;
    this. farmerModelObj. bankName = this.formValue.value. bankName;
    this. farmerModelObj. accountNumber = this.formValue.value. accountNumber;
    this. farmerModelObj. emailAddres = this.formValue.value. emailAddres;
    this. farmerModelObj. phoneNumber = this.formValue.value. phoneNumber;
    this. farmerModelObj. relationship = this.formValue.value. relationship;

    this.api.updateFarmer(this. farmerModelObj,this. farmerModelObj.id)
    .subscribe(res=>{
      alert("Updated Successfully")
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    })
  
  
  }

}
