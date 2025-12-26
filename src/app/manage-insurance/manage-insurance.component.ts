
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductInsurance } from './product-insurance.model';
import { ProductInsuranceService } from '../shared/product-insurance.service';
import { OrganizationService } from '../shared/organization.service';


declare var bootstrap: any;

@Component({
  selector: 'app-manage-insurance',
  templateUrl: './manage-insurance.component.html',
  styleUrls: ['./manage-insurance.component.css']
})
export class ManageInsuranceComponent implements OnInit {

  productForm!: FormGroup;
  productInsuranceList: ProductInsurance[] = [];
  filteredProducts: ProductInsurance[] = [];
  selectedProduct: ProductInsurance | null = null;
organizationTypes: any[] = [];
countries: any[] = [];
  organizations: any[] = [];
  productCategories: any[] = [];
  seasons: any[] = [];
  crops: any[] = [];
  cropVarieties: any[] = [];

  isEditMode = false;
  searchText = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductInsuranceService,
    private OrganizationService: OrganizationService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdownData();
    this.loadProducts();
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      product_name: ['', [Validators.required, Validators.minLength(3)]],
      organisation: ['', Validators.required],
      product_category: ['', Validators.required],
      season: ['', Validators.required],
      crop: ['', Validators.required],
      crop_variety: [''],
      average_premium_rate: ['', [Validators.required, Validators.min(0)]],
      sum_insured: ['', [Validators.required, Validators.min(0)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  loadDropdownData(): void {
    // Load organizations
    this.OrganizationService.getOrganizations().subscribe({
      next: (data) => {
        const response = data as any;
        this.organizations = response.orgTypesResponse?.results || [];
        this.organizationTypes = response.orgTypesResponse;
        this.countries = response.countriesResponse?.results || [];
        console.log('org',this.organizations);

      },
      error: (err) => console.error('Error loading organizations:', err)
    });

    // Load product categories
    this.productService.getProductCategories().subscribe({
      next: (data) => {
        this.productCategories = data.results || data;
      },
      error: (err) => console.error('Error loading categories:', err)
    });


    // Load seasons
    this.productService.getSeasons().subscribe({
      next: (data) => {
        this.seasons = data.results || data;
      },
      error: (err) => console.error('Error loading seasons:', err)
    });

    // Load crops
    this.productService.getCrops().subscribe({
      next: (data) => {
        this.crops = data.results || data;
      },
      error: (err) => console.error('Error loading crops:', err)
    });

    // Load crop varieties
    this.productService.getCropVarieties().subscribe({
      next: (data) => {
        this.cropVarieties = data.results || data;
      },
      error: (err) => console.error('Error loading crop varieties:', err)
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        this.productInsuranceList = response.results || response;
        this.filteredProducts = [...this.productInsuranceList];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.showError('Failed to load products');
        this.loading = false;
      }
    });
  }

  searchProducts(): void {
    if (!this.searchText.trim()) {
      this.filteredProducts = [...this.productInsuranceList];
      return;
    }

    const search = this.searchText.toLowerCase();
    this.filteredProducts = this.productInsuranceList.filter(product =>
      product.product_name.toLowerCase().includes(search) ||
      product.organisation_name?.toLowerCase().includes(search) ||
      product.crop_name?.toLowerCase().includes(search)
    );
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm.reset({
      status: 'ACTIVE'
    });
    this.showModal();
  }

  openEditModal(product: ProductInsurance): void {
    this.isEditMode = true;
    this.selectedProduct = product;

    this.productForm.patchValue({
      product_name: product.product_name,
      organisation: product.organisation,
      product_category: product.product_category,
      season: product.season,
      crop: product.crop,
      crop_variety: product.crop_variety,
      average_premium_rate: product.average_premium_rate,
      sum_insured: product.sum_insured,
      status: product.status
    });

    this.showModal();
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.showError('Please fill all required fields');
      return;
    }

    this.loading = true;
    const productData = this.productForm.value;

    if (this.isEditMode && this.selectedProduct) {
      // Update existing product
      this.productService.updateProduct(this.selectedProduct.product_id!, productData)
        .subscribe({
          next: (response) => {
            this.showSuccess('Product updated successfully');
            this.loadProducts();
            this.closeModal();
            this.loading = false;
          },
          error: (err) => {
            console.error('Error updating product:', err);
            this.showError('Failed to update product');
            this.loading = false;
          }
        });
    } else {
      // Create new product
      this.productService.createProduct(productData).subscribe({
        next: (response) => {
          this.showSuccess('Product created successfully');
          this.loadProducts();
          this.closeModal();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.showError('Failed to create product');
          this.loading = false;
        }
      });
    }
  }

  deleteProduct(product: ProductInsurance): void {
    if (!confirm(`Are you sure you want to delete "${product.product_name}"?`)) {
      return;
    }

    this.loading = true;
    this.productService.deleteProduct(product.product_id!).subscribe({
      next: () => {
        this.showSuccess('Product deleted successfully');
        this.loadProducts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.showError('Failed to delete product');
        this.loading = false;
      }
    });
  }

  exportProducts(): void {
    this.productService.exportProducts().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `product-insurance-${new Date().getTime()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showSuccess('Products exported successfully');
      },
      error: (err) => {
        console.error('Error exporting products:', err);
        this.showError('Failed to export products');
      }
    });
  }

  // Utility methods
  showModal(): void {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
  }

  closeModal(): void {
    const modalElement = document.getElementById('productModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
    this.productForm.reset();
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 3000);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }
}
