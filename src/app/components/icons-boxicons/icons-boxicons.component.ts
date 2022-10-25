import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-icons-boxicons',
  templateUrl: './icons-boxicons.component.html',
  styleUrls: ['./icons-boxicons.component.css']
})
export class IconsBoxiconsComponent implements OnInit {

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
      //description : ['']
      //email : [''],
     // mobile : [''],
     // salary : ['']
    })
  }

}
