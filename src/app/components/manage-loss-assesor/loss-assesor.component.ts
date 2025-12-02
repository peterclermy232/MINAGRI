import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LossAssessorService } from 'src/app/shared/loss.service';
import { LossModel } from './loss';

@Component({
  selector: 'app-loss-assesor',
  templateUrl: './loss-assesor.component.html',
  styleUrls: ['./loss-assesor.component.css']
})
export class LossAssesor implements OnInit {

  formValue!: FormGroup;
  lossModelObj: LossModel = new LossModel();
  lossData: any;
  showAdd: boolean = false;
  showUpdate: boolean = false;

  constructor(
    private formbuilder: FormBuilder,
    private api: LossAssessorService
  ) {}

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      organization: [''],
      user: [''],
      practiceNumber: [''],
      status: ['']
    });

    this.getAllEmployee();
  }

  clickAddEmployee() {
    this.formValue.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  // ✔ FIXED: NO PARAMETER NEEDED
  postEmployeeDetails() {
    this.lossModelObj.organization = this.formValue.value.organization;
    this.lossModelObj.user = this.formValue.value.user;
    this.lossModelObj.practiceNumber = this.formValue.value.practiceNumber;
    this.lossModelObj.status = this.formValue.value.status;

    this.api.createLossAssessor(this.lossModelObj)
      .subscribe(res => {
        alert("Loss Assessor Added Successfully");
        document.getElementById('cancel')?.click();
        this.formValue.reset();
        this.getAllEmployee();
      });
  }

  // ✔ FIXED: NO PARAMETER NEEDED
  getAllEmployee() {
  this.api.getAllLossAssessors().subscribe(res => {
    this.lossData = res;
  });
}


  deleteEmployee(user: any) {
    this.api.deleteLossAssessor(user.id)
      .subscribe(res => {
        alert("Loss Assessor Deleted");
        this.getAllEmployee();
      });
  }

  onEdit(user: any) {
    this.showAdd = false;
    this.showUpdate = true;

    this.lossModelObj.id = user.id;

    this.formValue.patchValue({
      organization: user.organization,
      user: user.user,
      practiceNumber: user.practiceNumber,
      status: user.status
    });
  }

  // ✔ FIXED: NO PARAMETER NEEDED
  updateEmployeeDetails() {
    this.lossModelObj.organization = this.formValue.value.organization;
    this.lossModelObj.user = this.formValue.value.user;
    this.lossModelObj.practiceNumber = this.formValue.value.practiceNumber;
    this.lossModelObj.status = this.formValue.value.status;

    this.api.updateLossAssessor(this.lossModelObj, this.lossModelObj.id)
      .subscribe(res => {
        alert("Updated Successfully");
        document.getElementById('cancel')?.click();
        this.formValue.reset();
        this.getAllEmployee();
      });
  }
}
