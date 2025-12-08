import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuotationService } from '../shared/quotation.service';
import { PolicyModel } from './quotation';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.css']
})
export class QuotationComponent implements OnInit {

  formValue!: FormGroup;
  quotationModelObj: PolicyModel = new PolicyModel();
  quotationData: any[] = [];
  filteredQuotations: any[] = [];
  showAdd: boolean = false;
  showUpdate: boolean = false;
  isLoading: boolean = false;
  searchText: string = '';

  // Dropdown data
  farmers: any[] = [];
  farms: any[] = [];
  allFarms: any[] = []; // Store all farms for filtering
  insuranceProducts: any[] = [];
  selectedFarmerId: number = 0;

  // Pagination
  page: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  constructor(
    private formbuilder: FormBuilder,
    private api: QuotationService
  ) { }

  ngOnInit(): void {
    // Initialize form
    this.formValue = this.formbuilder.group({
      farmer: ['', Validators.required],
      farm: ['', Validators.required],
      insurance_product: ['', Validators.required],
      premium_amount: [0, [Validators.required, Validators.min(0.01)]],
      sum_insured: [0, [Validators.required, Validators.min(0.01)]],
      status: ['OPEN']
    });

    // Initialize arrays
    this.quotationData = [];
    this.filteredQuotations = [];
    this.farmers = [];
    this.farms = [];
    this.allFarms = [];
    this.insuranceProducts = [];

    // Load data
    this.loadFarmers();
    this.loadAllFarms(); // Load all farms for reference
    this.loadInsuranceProducts();
    this.getAllQuotations();
  }

  clickAddEmployee() {
    this.formValue.reset();
    this.formValue.patchValue({
      status: 'OPEN',
      premium_amount: 0,
      sum_insured: 0
    });
    this.showAdd = true;
    this.showUpdate = false;
    this.farms = []; // Reset farms
  }

  /**
   * Load farmers for dropdown
   */
  loadFarmers() {
    this.api.getFarmers().subscribe({
      next: (res) => {
        console.log('Farmers API response:', res);

        if (Array.isArray(res)) {
          this.farmers = res;
        } else if (res && Array.isArray(res.results)) {
          this.farmers = res.results;
        } else {
          this.farmers = [];
        }

        console.log('Farmers loaded:', this.farmers.length);
      },
      error: (error) => {
        console.error('Error loading farmers:', error);
        this.farmers = [];
        alert('Failed to load farmers. Please refresh the page.');
      }
    });
  }

  /**
   * Load all farms (for display purposes)
   */
  loadAllFarms() {
    this.api.getAllFarms().subscribe({
      next: (res) => {
        console.log('All Farms API response:', res);

        if (Array.isArray(res)) {
          this.allFarms = res;
        } else if (res && Array.isArray(res.results)) {
          this.allFarms = res.results;
        } else {
          this.allFarms = [];
        }

        console.log('All farms loaded:', this.allFarms.length);
      },
      error: (error) => {
        console.error('Error loading all farms:', error);
        this.allFarms = [];
      }
    });
  }

  /**
   * Load farms when farmer is selected
   */
  onFarmerChange(event: any) {
    const farmerId = event.target.value;
    console.log('Farmer selected:', farmerId);

    if (farmerId) {
      this.selectedFarmerId = Number(farmerId);
      this.loadFarmsByFarmer(this.selectedFarmerId);
    } else {
      this.farms = [];
      this.formValue.patchValue({ farm: '' });
    }
  }

  /**
   * Load farms by farmer ID
   */
  loadFarmsByFarmer(farmerId: number) {
    console.log('Loading farms for farmer ID:', farmerId);

    this.api.getFarmsByFarmer(farmerId).subscribe({
      next: (res) => {
        console.log('Farms API response:', res);

        if (Array.isArray(res)) {
          this.farms = res;
        } else if (res && Array.isArray(res.results)) {
          this.farms = res.results;
        } else {
          this.farms = [];
        }

        console.log('Farms loaded for farmer:', this.farms.length);

        if (this.farms.length === 0) {
          alert('No farms found for this farmer. Please add a farm first.');
        }
      },
      error: (error) => {
        console.error('Error loading farms:', error);
        this.farms = [];
        alert('Failed to load farms for this farmer.');
      }
    });
  }

  /**
   * Load insurance products for dropdown
   */
  loadInsuranceProducts() {
    this.api.getInsuranceProducts('ACTIVE').subscribe({
      next: (res) => {
        console.log('Insurance Products API response:', res);

        if (Array.isArray(res)) {
          this.insuranceProducts = res;
        } else if (res && Array.isArray(res.results)) {
          this.insuranceProducts = res.results;
        } else {
          this.insuranceProducts = [];
        }

        console.log('Insurance products loaded:', this.insuranceProducts.length);
      },
      error: (error) => {
        console.error('Error loading insurance products:', error);
        this.insuranceProducts = [];
        alert('Failed to load insurance products. Please refresh the page.');
      }
    });
  }

  /**
   * Calculate premium when product is selected
   */
  onProductChange(event: any) {
    const productId = Number(event.target.value);
    console.log('Product selected:', productId);

    if (productId) {
      const product = this.insuranceProducts.find(p => p.product_id === productId);
      if (product && product.average_premium_rate) {
        const sumInsured = this.formValue.get('sum_insured')?.value || 0;
        const calculatedPremium = sumInsured * (product.average_premium_rate / 100);

        console.log('Auto-calculating premium:', {
          sumInsured,
          rate: product.average_premium_rate,
          premium: calculatedPremium
        });

        this.formValue.patchValue({
          premium_amount: calculatedPremium
        });
      }
    }
  }

  /**
   * Helper function to get farmer name by ID
   */
  getFarmerName(farmerId: number): string {
    const farmer = this.farmers.find(f => f.farmer_id === farmerId);
    return farmer ? `${farmer.first_name} ${farmer.last_name}` : 'N/A';
  }

  /**
   * Helper function to get farm name by ID
   */
  getFarmName(farmId: number): string {
    const farm = this.allFarms.find(f => f.farm_id === farmId);
    return farm ? farm.farm_name : 'N/A';
  }

  /**
   * Helper function to get product name by ID
   */
  getProductName(productId: number): string {
    const product = this.insuranceProducts.find(p => p.product_id === productId);
    return product ? product.product_name : 'N/A';
  }

  /**
   * Get all quotations
   */
  getAllQuotations() {
    this.isLoading = true;
    this.api.getQuotations().subscribe({
      next: (res) => {
        console.log('Quotations API response:', res);

        if (Array.isArray(res)) {
          this.quotationData = res;
        } else if (res && Array.isArray(res.results)) {
          this.quotationData = res.results;
        } else if (res && Array.isArray(res.quotations)) {
          // Handle the case where backend returns {quotations: [...]}
          this.quotationData = res.quotations;
        } else {
          this.quotationData = [];
        }

        console.log('Quotations loaded:', this.quotationData.length);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading quotations:', error);
        this.quotationData = [];
        this.filteredQuotations = [];
        this.isLoading = false;
        alert('Failed to load quotations. Please try again.');
      }
    });
  }

  /**
   * Create a new quotation
   */
  postEmployeeDetails() {
    // Mark all fields as touched
    Object.keys(this.formValue.controls).forEach(key => {
      this.formValue.get(key)?.markAsTouched();
    });

    if (this.formValue.invalid) {
      console.log('Form validation errors:', this.formValue.errors);
      alert('Please fill in all required fields correctly');
      return;
    }

    this.isLoading = true;
    const quotationData = {
      farmer: Number(this.formValue.value.farmer),
      farm: Number(this.formValue.value.farm),
      insurance_product: Number(this.formValue.value.insurance_product),
      premium_amount: Number(this.formValue.value.premium_amount),
      sum_insured: Number(this.formValue.value.sum_insured),
      status: this.formValue.value.status
    };

    console.log('Creating quotation with data:', quotationData);

    this.api.postQuotation(quotationData).subscribe({
      next: (res) => {
        console.log('Quotation created successfully:', res);
        alert('Quotation Created Successfully!');
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.farms = [];
        this.getAllQuotations();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating quotation:', error);
        this.isLoading = false;

        let errorMsg = 'Something went wrong';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error.detail) {
            errorMsg = error.error.detail;
          } else if (error.error.message) {
            errorMsg = error.error.message;
          } else if (error.error.errors) {
            errorMsg = JSON.stringify(error.error.errors);
          }
        }

        alert(`Failed to create quotation: ${errorMsg}`);
      }
    });
  }

  /**
   * Edit quotation
   */
  onEdit(row: any) {
    console.log('Editing quotation:', row);
    this.showAdd = false;
    this.showUpdate = true;
    this.quotationModelObj.id = row.quotation_id;

    // Load farms for selected farmer
    if (row.farmer) {
      this.loadFarmsByFarmer(row.farmer);
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

  /**
   * Update quotation
   */
  updateEmployeeDetails() {
    // Mark all fields as touched
    Object.keys(this.formValue.controls).forEach(key => {
      this.formValue.get(key)?.markAsTouched();
    });

    if (this.formValue.invalid) {
      alert('Please fill in all required fields correctly');
      return;
    }

    if (!this.quotationModelObj.id) {
      alert('Invalid quotation ID');
      return;
    }

    this.isLoading = true;
    const quotationData = {
      farmer: Number(this.formValue.value.farmer),
      farm: Number(this.formValue.value.farm),
      insurance_product: Number(this.formValue.value.insurance_product),
      premium_amount: Number(this.formValue.value.premium_amount),
      sum_insured: Number(this.formValue.value.sum_insured),
      status: this.formValue.value.status
    };

    console.log('Updating quotation:', this.quotationModelObj.id, quotationData);

    this.api.updateQuotation(quotationData, this.quotationModelObj.id).subscribe({
      next: (res) => {
        console.log('Quotation updated successfully:', res);
        alert('Updated Successfully!');
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.farms = [];
        this.getAllQuotations();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating quotation:', error);
        this.isLoading = false;

        let errorMsg = 'Something went wrong';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error.detail) {
            errorMsg = error.error.detail;
          } else if (error.error.errors) {
            errorMsg = JSON.stringify(error.error.errors);
          }
        }

        alert(`Failed to update quotation: ${errorMsg}`);
      }
    });
  }

  /**
   * Delete quotation
   */
  deleteQuotation(id: number) {
    if (confirm('Are you sure you want to delete this quotation?')) {
      this.isLoading = true;
      this.api.deleteQuotation(id).subscribe({
        next: (res) => {
          console.log('Quotation deleted successfully:', res);
          alert('Quotation deleted successfully');
          this.getAllQuotations();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting quotation:', error);
          this.isLoading = false;
          alert('Failed to delete quotation');
        }
      });
    }
  }

  /**
   * Mark quotation as paid
   */
  markAsPaid(id: number) {
    const paymentRef = prompt('Enter payment reference:');
    if (paymentRef && paymentRef.trim()) {
      this.isLoading = true;
      this.api.markAsPaid(id, paymentRef).subscribe({
        next: (res) => {
          console.log('Marked as paid:', res);
          alert('Quotation marked as paid successfully!');
          this.getAllQuotations();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error marking as paid:', error);
          this.isLoading = false;

          let errorMsg = 'Failed to mark as paid';
          if (error.error?.error) {
            errorMsg = error.error.error;
          }

          alert(errorMsg);
        }
      });
    }
  }

  /**
   * Write policy from quotation
   */
  writePolicy(id: number) {
    if (confirm('Convert this quotation to a written policy?')) {
      this.isLoading = true;
      this.api.writePolicy(id).subscribe({
        next: (res) => {
          console.log('Policy written:', res);
          alert(`Policy written successfully! Policy Number: ${res.policy_number}`);
          this.getAllQuotations();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error writing policy:', error);
          this.isLoading = false;

          let errorMsg = 'Failed to write policy';
          if (error.error?.error) {
            errorMsg = error.error.error;
          }

          alert(errorMsg);
        }
      });
    }
  }

  /**
   * Apply filters and pagination
   */
  applyFilters() {
    if (!Array.isArray(this.quotationData)) {
      console.error('quotationData is not an array:', this.quotationData);
      this.quotationData = [];
      this.filteredQuotations = [];
      this.totalPages = 1;
      return;
    }

    let data = [...this.quotationData];

    // Apply search filter
    if (this.searchText && this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase().trim();
      data = data.filter(item => {
        const policyNumber = (item.policy_number || '').toLowerCase();
        const status = (item.status || '').toLowerCase();
        const farmerName = this.getFarmerName(item.farmer).toLowerCase();

        return policyNumber.includes(searchLower) ||
               status.includes(searchLower) ||
               farmerName.includes(searchLower);
      });
    }

    // Calculate pagination
    this.totalPages = Math.ceil(data.length / this.pageSize) || 1;

    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
    if (this.page < 1) {
      this.page = 1;
    }

    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.filteredQuotations = data.slice(start, end);

    console.log('Filters applied:', {
      total: this.quotationData.length,
      filtered: data.length,
      displayed: this.filteredQuotations.length,
      page: this.page,
      totalPages: this.totalPages
    });
  }

  /**
   * Search handler
   */
  onSearchChange() {
    this.page = 1;
    this.applyFilters();
  }

  /**
   * Pagination
   */
  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.applyFilters();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.applyFilters();
    }
  }
}
