import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-charts-apexcharts',
  templateUrl: './charts-apexcharts.component.html',
  styleUrls: ['./charts-apexcharts.component.css']
})
export class ChartsApexchartsComponent implements OnInit {

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
