import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-manage-insurance',
  templateUrl: './manage-insurance.component.html',
  styleUrls: ['./manage-insurance.component.css']
})
export class ManageInsuranceComponent implements OnInit {

  
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
      description : ['']
      //email : [''],
     // mobile : [''],
     // salary : ['']
    })
  }

}
