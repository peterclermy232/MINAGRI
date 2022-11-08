import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-forcast',
  templateUrl: './forcast.component.html',
  styleUrls: ['./forcast.component.css']
})
export class ForcastComponent implements OnInit {
  formValue !:FormGroup;
 
  
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder : FormBuilder) { }

  ngOnInit(): void {
  }

}
