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
      premium_amount: [0, [Validators.required, Validators.min(0)]],
      sum_insured: [0, [Validators.required, Validators.min(0)]],
      status: ['OPEN']
    });

    // Initialize arrays
    this.quotationData = [];
    this.filteredQuotations = [];

    // Load data
    this.loadFarmers();
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
        if (Array.isArray(res)) {
          this.farmers = res;
        } else if (res && Array.isArray(res.results)) {
          this.farmers = res.results;
        } else {
          this.farmers = [];
        }
      },
      error: (error) => {
        console.error('Error loading farmers:', error);
        this.farmers = [];
      }
    });
  }

  /**
   * Load farms when farmer is selected
   */
  onFarmerChange(event: any) {
    const farmerId = event.target.value;
    if (farmerId) {
      this.selectedFarmerId = Number(farmerId);
      this.loadFarmsByFarmer(this.selectedFarmerId);
    } else {
      this.farms = [];
    }
  }

  /**
   * Load farms by farmer ID
   */
  loadFarmsByFarmer(farmerId: number) {
    this.api.getFarmsByFarmer(farmerId).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.farms = res;
        } else if (res && Array.isArray(res.results)) {
          this.farms = res.results;
        } else {
          this.farms = [];
        }
      },
      error: (error) => {
        console.error('Error loading farms:', error);
        this.farms = [];
      }
    });
  }

  /**
   * Load insurance products for dropdown
   */
  loadInsuranceProducts() {
    this.api.getInsuranceProducts('ACTIVE').subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.insuranceProducts = res;
        } else if (res && Array.isArray(res.results)) {
          this.insuranceProducts = res.results;
        } else {
          this.insuranceProducts = [];
        }
      },
      error: (error) => {
        console.error('Error loading insurance products:', error);
        this.insuranceProducts = [];
      }
    });
  }

  /**
   * Calculate premium when product is selected
   */
  onProductChange(event: any) {
    const productId = Number(event.target.value);
    if (productId) {
      const product = this.insuranceProducts.find(p => p.product_id === productId);
      if (product) {
        // Auto-fill sum_insured from product
        this.formValue.patchValue({
          sum_insured: product.sum_insured,
          premium_amount: product.sum_insured * (product.average_premium_rate / 100)
        });
      }
    }
  }

  /**
   * Get all quotations
   */
  getAllQuotations() {
    this.isLoading = true;
    this.api.getQuotations().subscribe({
      next: (res) => {
        console.log('Quotations loaded from API:', res);

        if (Array.isArray(res)) {
          this.quotationData = res;
        } else if (res && Array.isArray(res.results)) {
          this.quotationData = res.results;
        } else {
          this.quotationData = [];
        }

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
      alert('Please fill in all required fields correctly');
      return;
    }

    this.isLoading = true;
    const quotationData = this.formValue.value;

    this.api.postQuotation(quotationData).subscribe({
      next: (res) => {
        console.log('Quotation created:', res);
        alert('Quotation Created Successfully');
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.getAllQuotations();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating quotation:', error);
        this.isLoading = false;
        const errorMsg = error.error?.detail || error.error?.message || 'Something went wrong';
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
    const quotationData = this.formValue.value;

    this.api.updateQuotation(quotationData, this.quotationModelObj.id).subscribe({
      next: (res) => {
        console.log('Quotation updated:', res);
        alert('Updated Successfully');
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.getAllQuotations();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating quotation:', error);
        this.isLoading = false;
        const errorMsg = error.error?.detail || error.error?.message || 'Something went wrong';
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
          console.log('Quotation deleted:', res);
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
    if (paymentRef) {
      this.isLoading = true;
      this.api.markAsPaid(id, paymentRef).subscribe({
        next: (res) => {
          alert('Quotation marked as paid successfully');
          this.getAllQuotations();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error marking as paid:', error);
          this.isLoading = false;
          alert('Failed to mark as paid');
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
          alert(`Policy written successfully! Policy Number: ${res.policy_number}`);
          this.getAllQuotations();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error writing policy:', error);
          this.isLoading = false;
          const errorMsg = error.error?.error || 'Failed to write policy';
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
        return policyNumber.includes(searchLower) || status.includes(searchLower);
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
