import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-manage-farmer',
  templateUrl: './manage-farmer.component.html',
  styleUrls: ['./manage-farmer.component.css']
})
export class ManageFarmerComponent implements OnInit {

 
  formValue !:FormGroup;
  //employeeModelObj : EmployeeModel = new EmployeeModel();
  employeeData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      name : [''],
      firstName : [''],
      lastName : [''],
      physicalAddress : [''],
      id : [''],
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
  
  }

}
