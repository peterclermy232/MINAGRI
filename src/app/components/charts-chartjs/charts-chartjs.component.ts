import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-charts-chartjs',
  templateUrl: './charts-chartjs.component.html',
  styleUrls: ['./charts-chartjs.component.css']
})
export class ChartsChartjsComponent implements OnInit {

  
  formValue !:FormGroup;
  //employeeModelObj : EmployeeModel = new EmployeeModel();
  employeeData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder: FormBuilder) { }

  ngOnInit(): void {

    this.formValue = this.formbuilder.group({
      organization : [''],
      user : [''],
      practiceNumber : [''],
     status : ['']
    })
   
  }
}
