import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-icons-bootstrap',
  templateUrl: './icons-bootstrap.component.html',
  styleUrls: ['./icons-bootstrap.component.css']
})
export class IconsBootstrapComponent implements OnInit {

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
      status : ['']
      //email : [''],
     // mobile : [''],
     // salary : ['']
    })
  }

}
