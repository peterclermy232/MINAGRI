import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-historical',
  templateUrl: './historical.component.html',
  styleUrls: ['./historical.component.css']
})
export class HistoricalComponent implements OnInit {
  formValue !:FormGroup;
 
  
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder : FormBuilder) { }

  ngOnInit(): void {
  }

}
