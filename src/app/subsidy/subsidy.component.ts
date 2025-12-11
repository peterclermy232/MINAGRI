import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubsidyModel } from './subsidy';
import { SubsidyService } from '../shared/subsidy.service';


@Component({
  selector: 'app-subsidy',
  templateUrl: './subsidy.component.html',
  styleUrls: ['./subsidy.component.css']
})
export class SubsidyComponent implements OnInit {

  formValue!: FormGroup;
  subsidyModelObj: SubsidyModel = new SubsidyModel();
  subsidyData: any[] = [];

  // Related data from backend
  organizations: any[] = [];
  insuranceProducts: any[] = [];

  showAdd!: boolean;
  showUpdate!: boolean;

  constructor(
    private formbuilder: FormBuilder,
    private api: SubsidyService
  ) {}

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      organisation: ['', Validators.required],
      insurance_product: ['', Validators.required],
      subsidy_name: ['', Validators.required],
      subsidy_rate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      status: ['ACTIVE']
    });

    this.loadSubsidies();
    this.loadRelatedData();
  }

  // Load all subsidies
  loadSubsidies() {
    this.api.getSubsidies().subscribe({
      next: (res) => {
        this.subsidyData = res;
        console.log('Subsidies loaded:', this.subsidyData);
      },
      error: (err) => {
        console.error('Error loading subsidies:', err);
        alert('Failed to load subsidies');
      }
    });
  }

  // Load organizations and insurance products
  loadRelatedData() {
    this.api.getOrganizations().subscribe({
      next: (res) => {
        this.organizations = res;
        console.log('Organizations loaded:', this.organizations);
      },
      error: (err) => console.error('Error loading organizations:', err)
    });

    this.api.getInsuranceProducts().subscribe({
      next: (res) => {
        this.insuranceProducts = res;
        console.log('Insurance products loaded:', this.insuranceProducts);
      },
      error: (err) => console.error('Error loading insurance products:', err)
    });
  }

  clickAddSubsidy() {
    this.formValue.reset();
    this.formValue.patchValue({ status: 'ACTIVE' });
    this.showAdd = true;
    this.showUpdate = false;
  }

  // POST NEW SUBSIDY
  postSubsidyDetails() {
    if (this.formValue.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    this.subsidyModelObj.organisation = this.formValue.value.organisation;
    this.subsidyModelObj.insurance_product = this.formValue.value.insurance_product;
    this.subsidyModelObj.subsidy_name = this.formValue.value.subsidy_name;
    this.subsidyModelObj.subsidy_rate = this.formValue.value.subsidy_rate;
    this.subsidyModelObj.status = this.formValue.value.status;

    this.api.postSubsidy(this.subsidyModelObj).subscribe({
      next: (res) => {
        alert("Subsidy Created Successfully");
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.loadSubsidies();
      },
      error: (err) => {
        console.error('Error creating subsidy:', err);
        alert('Failed to create subsidy: ' + (err.error?.detail || 'Unknown error'));
      }
    });
  }

  onEdit(row: any) {
    this.showAdd = false;
    this.showUpdate = true;

    this.subsidyModelObj.subsidy_id = row.subsidy_id;

    this.formValue.patchValue({
      organisation: row.organisation,
      insurance_product: row.insurance_product,
      subsidy_name: row.subsidy_name,
      subsidy_rate: row.subsidy_rate,
      status: row.status
    });
  }

  // UPDATE SUBSIDY
  updateSubsidyDetails() {
    if (this.formValue.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    const data = {
      organisation: this.formValue.value.organisation,
      insurance_product: this.formValue.value.insurance_product,
      subsidy_name: this.formValue.value.subsidy_name,
      subsidy_rate: this.formValue.value.subsidy_rate,
      status: this.formValue.value.status
    };

    this.api.updateSubsidy(data, this.subsidyModelObj.subsidy_id).subscribe({
      next: (res) => {
        alert("Subsidy Updated Successfully");
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.loadSubsidies();
      },
      error: (err) => {
        console.error('Error updating subsidy:', err);
        alert('Failed to update subsidy: ' + (err.error?.detail || 'Unknown error'));
      }
    });
  }

  // DELETE SUBSIDY
  deleteSubsidy(row: any) {
    if (!confirm("Are you sure you want to delete this subsidy?")) return;

    this.api.deleteSubsidy(row.subsidy_id).subscribe({
      next: (res) => {
        alert("Subsidy deleted successfully!");
        this.loadSubsidies();
      },
      error: (err) => {
        console.error('Error deleting subsidy:', err);
        alert('Failed to delete subsidy');
      }
    });
  }

  // Helper method to get organization name
  getOrganizationName(orgId: number): string {
    const org = this.organizations.find(o => o.organisation_id === orgId);
    return org ? org.organisation_name : 'N/A';
  }

  // Helper method to get insurance product name
  getProductName(productId: number): string {
    const product = this.insuranceProducts.find(p => p.product_id === productId);
    return product ? product.product_name : 'N/A';
  }
}
