import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../shared/product.service';
import { NotifierService } from '../services/notifier.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.css'],
})
export class ManageProductComponent implements OnInit {
  productCategoryForm: FormGroup;
  formSubmitted = false;
  currentProductCategory: any = null;
  isEditMode = false;

  modalBtn = {
    loading: false,
    text: 'Create Product Category',
  };

  organisations: any[] = [];
  coverTypes: any[] = [];
  productCategories: any[] = [];
  filteredCategories: any[] = [];
  isLoading = false;
  searchText = '';

  constructor(
    private productService: ProductService,
    private notifierService: NotifierService,
    private fb: FormBuilder
  ) {
    this.productCategoryForm = this.fb.group({
      cover_type_id: ['', [Validators.required]],
      description: ['', [Validators.required]],
      organisation_id: ['', [Validators.required]],
      product_category: ['', [Validators.required]],
      status: [true, Validators.required],
      productCategoryId: [null],
    });
  }

  ngOnInit(): void {
    this.getProductCategories();
  }

  getProductCategories() {
    this.isLoading = true;
    this.productService
      .getProductCategories()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(
        (resp: any) => {
          console.log('rsp', resp);

          const orgs = resp.organisationsResponse?.results || resp.organisationsResponse || [];
         const coverTypesData = resp.coverTypesResponse?.results || resp.coverTypesResponse || [];
          const prodcatsData = resp.productCategoryResponse?.results || resp.productCategoryResponse || [];

          this.coverTypes = coverTypesData;
          this.organisations = orgs;

          this.productCategories = prodcatsData.map((productCat: any) => {
            const org = orgs.find(
              (o: any) => o.organisation_id === productCat.organisationId
            );
            const coverType = coverTypesData.find(
              (ct: any) => ct.cover_type_id === productCat.coverTypeId
            );

            return {
              ...productCat,
              coverTypeName: coverType ? coverType.cover_type : 'N/A',
              organisationName: org ? org.organisation_name : 'N/A',
            };
          });

          this.filteredCategories = [...this.productCategories];
        },
        (err) => {
          console.error('Error fetching product categories:', err);
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: 'Failed to load product categories',
          });
        }
      );
  }

  onSearch() {
    if (!this.searchText.trim()) {
      this.filteredCategories = [...this.productCategories];
      return;
    }

    const search = this.searchText.toLowerCase();
    this.filteredCategories = this.productCategories.filter(cat =>
      cat.product_category?.toLowerCase().includes(search) ||
      cat.description?.toLowerCase().includes(search) ||
      cat.coverTypeName?.toLowerCase().includes(search) ||
      cat.organisationName?.toLowerCase().includes(search)
    );
  }

  showCreateModal() {
    this.isEditMode = false;
    this.currentProductCategory = null;
    this.productCategoryForm.reset({ status: true });
    this.modalBtn.text = 'Create Product Category';
  }

  showEditModal(productCategory: any) {
    this.isEditMode = true;
    this.currentProductCategory = productCategory;
    this.modalBtn.text = 'Update Product Category';

    this.productCategoryForm.patchValue({
      cover_type_id: productCategory.coverTypeId,
      description: productCategory.description,
      organisation_id: productCategory.organisationId,
      product_category: productCategory.product_category,
      status: productCategory.status,
      productCategoryId: productCategory.product_category_id,
    });
  }

  handleSubmit() {
    this.formSubmitted = true;

    if (this.productCategoryForm.invalid) {
      this.notifierService.showSweetAlert({
        typ: 'error',
        message: 'Please fill all required fields',
      });
      return;
    }

    if (this.isEditMode) {
      this.updateProductCategory();
    } else {
      this.createProductCategory();
    }
  }

  createProductCategory() {
    this.modalBtn.loading = true;
    this.modalBtn.text = 'Processing...';

    const payload = {
      cover_type: this.productCategoryForm.get('cover_type_id')?.value,
      deleted: false,
      description: this.productCategoryForm.get('description')?.value,
      organisation: this.productCategoryForm.get('organisation_id')?.value,
      product_category: this.productCategoryForm.get('product_category')?.value,
      status: this.productCategoryForm.get('status')?.value,
    };

    this.productService
      .postProductCategory(payload)
      .pipe(
        finalize(() => {
          this.modalBtn.loading = false;
          this.modalBtn.text = 'Create Product Category';
        })
      )
      .subscribe(
        (resp) => {
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Product category created successfully!',
            timer: true,
          });
          this.closeModal();
          this.getProductCategories();
        },
        (err) => {
          const errorMessage =
            err.error?.errors?.[0]?.message ||
            err.error?.detail ||
            'Failed to create product category';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }

  updateProductCategory() {
    this.modalBtn.loading = true;
    this.modalBtn.text = 'Processing...';

    const payload = {
      coverTypeId: this.productCategoryForm.get('cover_type_id')?.value,
      deleted: false,
      description: this.productCategoryForm.get('description')?.value,
      organisationId: this.productCategoryForm.get('organisation_id')?.value,
      product_category: this.productCategoryForm.get('product_category')?.value,
      status: this.productCategoryForm.get('status')?.value,
      recordVersion: this.currentProductCategory?.recordVersion || 1,
      product_category_id: this.currentProductCategory?.product_category_id,
      cover_type: parseInt(this.productCategoryForm.get('cover_type_id')?.value),
     organisation: parseInt(this.productCategoryForm.get('organisation_id')?.value)
    };

    this.productService
      .updateProductCategory(payload, this.currentProductCategory.product_category_id)
      .pipe(
        finalize(() => {
          this.modalBtn.loading = false;
          this.modalBtn.text = 'Update Product Category';
        })
      )
      .subscribe(
        (resp) => {
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Product category updated successfully!',
            timer: true,
          });
          this.closeModal();
          this.getProductCategories();
        },
        (err) => {
          const errorMessage =
            err.error?.errors?.[0]?.message ||
            err.error?.detail ||
            'Failed to update product category';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }

  deleteProductCategory(category: any) {
    if (!confirm(`Are you sure you want to delete "${category.product_category}"?`)) {
      return;
    }

    const payload = {
      ...category,
      deleted: true,
      status: false,
    };

    this.productService
      .updateProductCategory(payload, category.product_category_id)
      .subscribe(
        (resp) => {
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Product category deleted successfully!',
            timer: true,
          });
          this.getProductCategories();
        },
        (err) => {
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: 'Failed to delete product category',
          });
        }
      );
  }

  closeModal() {
    this.productCategoryForm.reset({ status: true });
    this.formSubmitted = false;
    this.isEditMode = false;
    this.currentProductCategory = null;

    // Close modal programmatically
    const modalElement = document.getElementById('productCategoryModal');
    const modal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
    modal?.hide();
  }

  get f() {
    return this.productCategoryForm.controls;
  }
}
