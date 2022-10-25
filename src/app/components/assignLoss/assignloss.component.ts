import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-assignloss',
  templateUrl: './assignloss.component.html',
  styleUrls: ['./assignloss.component.css']
})
export class AssignlossComponent implements OnInit {

  formValue !:FormGroup;
  //employeeModelObj : EmployeeModel = new EmployeeModel();
  employeeData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      select : [''],
  
    })
  }

}
