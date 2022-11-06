import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CoverType,
  Crop,
  CropVariety,
  Organization,
  ProductCategory,
} from '../types';
import { AuthService } from '../shared/auth.service';
import { UserService } from '../shared/user.service';
import { CropService } from '../shared/crop.service';
import { NotifierService } from '../services/notifier.service';
import { finalize } from 'rxjs';
import { ProductService } from '../shared/product.service';

@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.css'],
})
export class ManageProductComponent implements OnInit {
  productCategoryForm: FormGroup;
  formSubmitted = false;
  currentProductCategory: null | ProductCategory = null;
  modalMode = {
    label: 'Create Product Category',
    typ: 'Create',
  };
  modalBtn = {
    loading: false,
    text: 'Create Product Category',
    classes: 'btn btn-primary',
  };
  organisations: Organization[] = [];
  coverTypes: CoverType[] = [];
  productCategories: {
    loading: boolean;
    data: Crop[] | any[];
  } = {
    loading: false,
    data: [],
  };

  dataTable = {
    columns: [
      {
        label: 'Product Category',
        data: 'productCategory',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Description',
        data: 'description',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Cover Type',
        data: 'coverType',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Organisation',
        data: 'organisation',
        dynamic: true,
        classes: '',
      },
      {
        label: 'Status',
        data: 'status',
        dynamic: false,
        classes: 'text-center',
      },
    ],
  };
  constructor(
    private authService: AuthService,
    private userService: UserService,
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
  // "coverTypeId": 1,
  // "deleted":false,
  // "description": "category two",
  // "organisationId":1,
  // "productCategory": "cat2",
  // "productCategoryId":1,
  // "recordVersion": 1,
  // "status": true
  ngOnInit(): void {
    this.getProductCategories();
  }

  showModal(productCategory?: ProductCategory) {
    if (productCategory) {
      this.modalMode.typ = 'edit';
      this.modalMode.label = 'Edit Product Category';
      this.modalBtn = {
        text: 'Edit Crop Variety',
        classes: 'btn btn-warning',
        loading: false,
      };
      this.currentProductCategory = productCategory;
      this.setProductCategoryInfo(productCategory);
    } else {
      this.modalMode.typ = 'create';
      this.modalMode.label = 'Create Product Category';
      this.modalBtn = {
        text: 'Create Product Category',
        classes: 'btn btn-primary',
        loading: false,
      };
      this.resetForm();
    }
  }
  setProductCategoryInfo(product: ProductCategory) {
    this.productCategoryForm
      .get('cover_type_id')!
      .setValue(product.coverTypeId);
    this.productCategoryForm.get('description')!.setValue(product.description);
    this.productCategoryForm
      .get('organisation_id')!
      .setValue(product.organisationId);
    this.productCategoryForm
      .get('product_category')!
      .setValue(product.productCategory);
    this.productCategoryForm
      .get('productCategoryId')!
      .setValue(product.productCategoryId);
    this.productCategoryForm.get('status')!.setValue(product.status);
  }
  getProductCategories() {
    this.productCategories.loading = true;
    this.productService
      .getProductCategories()
      .pipe(
        finalize(() => {
          this.productCategories.loading = false;
        })
      )
      .subscribe(
        (resp: any) => {
          console.log('resp', resp);
          const orgs = resp.organisationsResponse.results;
          const coverTypes = resp.coverTypesResponse;
          const prodcats = resp.productCategoryResponse;
          // this.crops.data = resp;
          this.coverTypes = coverTypes;
          this.organisations = orgs;
          console.log('resp categories', resp);
          this.productCategories.data = prodcats.map(
            (productCat: ProductCategory) => {
              const org = orgs.find(
                (typ: any) => typ.organisation_id === productCat.organisationId
              );
              console.log('org', org);
              const coverType = coverTypes.find(
                (cty: any) => cty.coverTypeId === productCat.coverTypeId
              );
              return {
                ...productCat,
                coverType: coverType ? coverType.coverType : 'none',
                organisation: org ? org.organisation_name : 'none',
              };
            }
          );
        },
        (err) => {
          console.log('crop err', err);
        }
      );
  }
  createProductCategory() {
    console.log('creating variety');
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    this.productService
      .postProductCategory({
        coverTypeId: this.productCategoryForm.get('cover_type_id')?.value,
        deleted: false,
        description: this.productCategoryForm.get('description')?.value,
        organisationId: this.productCategoryForm.get('organisation_id')?.value,
        productCategory:
          this.productCategoryForm.get('product_category')?.value,
        status: this.productCategoryForm.get('status')?.value,
      })
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Create Product Category',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('create resp', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Product category successfully created!',
            timer: true,
          });
          this.resetForm();
          this.getProductCategories();
        },
        (err) => {
          console.log('crop err', err);
          const errorMessage =
            err.error.errors[0].message || 'Invalid data submitted';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }
  updateProductCategory() {
    this.modalBtn = {
      loading: true,
      text: 'Processing...',
      classes: 'btn btn-primary',
    };
    // console.log('varietyform', this.cropVarietyForm);
    this.productService
      .updateProductCategory(
        {
          coverTypeId: this.productCategoryForm.get('cover_type_id')?.value,
          deleted: false,
          description: this.productCategoryForm.get('description')?.value,
          organisationId:
            this.productCategoryForm.get('organisation_id')?.value,
          productCategory:
            this.productCategoryForm.get('product_category')?.value,
          status: this.productCategoryForm.get('status')?.value,
          recordVersion: this.currentProductCategory?.recordVersion,
          productCategoryId: this.currentProductCategory?.productCategoryId,
        },
        this.currentProductCategory!.productCategoryId
      )
      .pipe(
        finalize(() => {
          this.modalBtn = {
            loading: false,
            text: 'Update Product Category',
            classes: 'btn btn-primary',
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('create resp', resp);
          this.notifierService.showSweetAlert({
            typ: 'success',
            message: 'Product category successfully updated!',
            timer: true,
          });
          this.resetForm();
          this.getProductCategories();
        },
        (err) => {
          console.log('crop err', err);
          const errorMessage =
            err.error.errors[0].message || 'Invalid data submitted';
          this.notifierService.showSweetAlert({
            typ: 'error',
            message: errorMessage,
          });
        }
      );
  }

  resetForm() {
    this.productCategoryForm.reset();
    this.productCategoryForm.markAsPristine();
    this.modalBtn = {
      loading: false,
      text: 'Create Product Category',
      classes: 'btn btn-primary',
    };
  }

  handleSubmit() {
    console.log('prodtc', this.productCategoryForm);
    if (this.productCategoryForm.invalid) {
      console.log('invalid');
      this.formSubmitted = true;
      return;
    }

    this.formSubmitted = false;

    if (this.productCategoryForm.get('productCategoryId')?.value) {
      this.updateProductCategory();
    } else {
      this.createProductCategory();
    }
  }
}
