import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WrittenService } from '../shared/written.service';
import { PolicyModel } from './written';

@Component({
  selector: 'app-written',
  templateUrl: './written.component.html',
  styleUrls: ['./written.component.css']
})
export class WrittenComponent implements OnInit {

  formValue!: FormGroup;
  policyModelObj: PolicyModel = new PolicyModel();
  policyData: any[] = [];

  showAdd!: boolean;
  showUpdate!: boolean;

  constructor(
    private formbuilder: FormBuilder,
    private api: WrittenService
  ) {}

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      idNumber: [''],
      farm: [''],
      insurance: [''],
      planting: [''],
      landSize: [''],
      measure: ['']
    });

    this.loadWrittenPolicies();
  }

  // Load all written policies
  loadWrittenPolicies() {
    this.api.getWrittenPolicies().subscribe(res => {
      this.policyData = res;
    });
  }

  clickAddPolicy() {
    this.formValue.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  // ❌ You CANNOT post a new policy using this service
  // If needed, you must add `postPolicy()` in your service
  // For now the button should be disabled or removed

  onEdit(row: any) {
    this.showAdd = false;
    this.showUpdate = true;

    this.policyModelObj.id = row.id;

    this.formValue.patchValue({
      idNumber: row.idNumber,
      farm: row.farm,
      insurance: row.insurance,
      planting: row.planting,
      landSize: row.landSize,
      measure: row.measure
    });
  }

  // UPDATE WRITTEN POLICY
  updatePolicyDetails() {
    const data = this.formValue.value;

    this.api.updatePolicy(data, this.policyModelObj.id).subscribe(res => {
      alert("Policy Updated Successfully");

      let ref = document.getElementById('cancel');
      ref?.click();

      this.formValue.reset();
      this.loadWrittenPolicies();
    });
  }

  // CANCEL POLICY
  cancelPolicy(row: any) {
    if (!confirm("Are you sure you want to cancel this policy?")) return;

    this.api.cancelPolicy(row.id).subscribe(res => {
      alert("Policy cancelled!");
      this.loadWrittenPolicies();
    });
  }

}
