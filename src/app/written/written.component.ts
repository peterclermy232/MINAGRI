import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  // Related data from backend
  farmers: any[] = [];
  farms: any[] = [];
  insuranceProducts: any[] = [];
  filteredFarms: any[] = [];

  showAdd!: boolean;
  showUpdate!: boolean;

  constructor(
    private formbuilder: FormBuilder,
    private api: WrittenService
  ) {}

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      farmer: ['', Validators.required],
      farm: ['', Validators.required],
      insurance_product: ['', Validators.required],
      premium_amount: ['', [Validators.required, Validators.min(0)]],
      sum_insured: ['', [Validators.required, Validators.min(0)]],
      status: ['WRITTEN']
    });

    this.loadWrittenPolicies();
    this.loadRelatedData();
  }

  // Load all written policies (quotations with status WRITTEN)
  loadWrittenPolicies() {
    this.api.getWrittenPolicies().subscribe({
      next: (res) => {
        this.policyData = res;
      },
      error: (err) => {
        console.error('Error loading written policies:', err);
        alert('Failed to load written policies');
      }
    });
  }

  // Load farmers, farms, and insurance products
  loadRelatedData() {
    this.api.getFarmers().subscribe({
      next: (res) => {
        this.farmers = res;
        console.log('farmers',this.farmers);

      },
      error: (err) => console.error('Error loading farmers:', err)
    });

    this.api.getFarms().subscribe({
      next: (res) => {
        this.farms = res;
      },
      error: (err) => console.error('Error loading farms:', err)
    });

    this.api.getInsuranceProducts().subscribe({
      next: (res) => {
        this.insuranceProducts = res;
        console.log('farmers2',this.insuranceProducts);

      },
      error: (err) => console.error('Error loading insurance products:', err)
    });
  }

  // When farmer is selected, filter farms belonging to that farmer
  onFarmerChange(event: any) {
  const farmerId = event.target.value;
  if (farmerId) {
    // Use the API method to get farms by farmer
    this.api.getFarmsByFarmer(parseInt(farmerId)).subscribe({
      next: (res) => {
        this.filteredFarms = res;
        console.log('Farms for farmer:', this.filteredFarms);
      },
      error: (err) => {
        console.error('Error loading farms for farmer:', err);
        this.filteredFarms = [];
      }
    });

    // Reset farm selection
    this.formValue.patchValue({ farm: '' });
  } else {
    this.filteredFarms = [];
  }
}

  clickAddPolicy() {
    this.formValue.reset();
    this.formValue.patchValue({ status: 'WRITTEN' });
    this.showAdd = true;
    this.showUpdate = false;
    this.filteredFarms = [];
  }

  // POST NEW WRITTEN POLICY
  postPolicyDetails() {
    if (this.formValue.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    this.policyModelObj.farmer = this.formValue.value.farmer;
    this.policyModelObj.farm = this.formValue.value.farm;
    this.policyModelObj.insurance_product = this.formValue.value.insurance_product;
    this.policyModelObj.premium_amount = this.formValue.value.premium_amount;
    this.policyModelObj.sum_insured = this.formValue.value.sum_insured;
    this.policyModelObj.status = 'WRITTEN';

    this.api.postPolicy(this.policyModelObj).subscribe({
      next: (res) => {
        alert("Written Policy Created Successfully");
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.loadWrittenPolicies();
      },
      error: (err) => {
        console.error('Error creating policy:', err);
        alert('Failed to create policy: ' + (err.error?.detail || 'Unknown error'));
      }
    });
  }

  onEdit(row: any) {
    this.showAdd = false;
    this.showUpdate = true;

    this.policyModelObj.quotation_id = row.quotation_id;

    // Load farms for the selected farmer
    if (row.farmer) {
      this.filteredFarms = this.farms.filter(farm =>
        farm.farmer === row.farmer
      );
    }

    this.formValue.patchValue({
      farmer: row.farmer,
      farm: row.farm,
      insurance_product: row.insurance_product,
      premium_amount: row.premium_amount,
      sum_insured: row.sum_insured,
      status: row.status
    });
  }

  // UPDATE WRITTEN POLICY
  updatePolicyDetails() {
    if (this.formValue.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    const data = {
      farmer: this.formValue.value.farmer,
      farm: this.formValue.value.farm,
      insurance_product: this.formValue.value.insurance_product,
      premium_amount: this.formValue.value.premium_amount,
      sum_insured: this.formValue.value.sum_insured,
      status: this.formValue.value.status
    };

    this.api.updatePolicy(data, this.policyModelObj.quotation_id).subscribe({
      next: (res) => {
        alert("Policy Updated Successfully");
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.loadWrittenPolicies();
      },
      error: (err) => {
        console.error('Error updating policy:', err);
        alert('Failed to update policy: ' + (err.error?.detail || 'Unknown error'));
      }
    });
  }

  // CANCEL POLICY
  cancelPolicy(row: any) {
    if (!confirm("Are you sure you want to cancel this policy?")) return;

    this.api.cancelPolicy(row.quotation_id).subscribe({
      next: (res) => {
        alert("Policy cancelled successfully!");
        this.loadWrittenPolicies();
      },
      error: (err) => {
        console.error('Error cancelling policy:', err);
        alert('Failed to cancel policy');
      }
    });
  }

  // Helper method to get farmer name
  getFarmerName(farmerId: number): string {
    const farmer = this.farmers.find(f => f.farmer_id === farmerId);
    return farmer ? `${farmer.first_name} ${farmer.last_name}` : 'N/A';
  }

  // Helper method to get farm name
  getFarmName(farmId: number): string {
    const farm = this.farms.find(f => f.farm_id === farmId);
    return farm ? farm.farm_name : 'N/A';
  }

  // Helper method to get insurance product name
  getProductName(productId: number): string {
    const product = this.insuranceProducts.find(p => p.product_id === productId);
    return product ? product.product_name : 'N/A';
  }
}
