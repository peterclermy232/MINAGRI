import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-advisory',
  templateUrl: './advisory.component.html',
  styleUrls: ['./advisory.component.css']
})
export class AdvisoryComponent implements OnInit {
  formValue !:FormGroup;
  
  constructor(private formbuilder : FormBuilder) { }

  ngOnInit(): void {
  }

}
