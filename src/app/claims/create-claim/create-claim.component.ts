// create-claim.component.ts - FIXED VERSION
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NotifierService } from '../../services/notifier.service';
import { ClaimCreateRequest, ClaimService } from '../../shared/claim.service';

interface Farmer {
  farmer_id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  phone_number: string;
  email?: string;
  organisation_name?: string;
}

interface Farm {
  farm_id: number;
  farm_name: string;
  farm_size: number;
  unit_of_measure: string;
  location_province?: string;
  location_district?: string;
  location_sector?: string;
}

interface Quotation {
  quotation_id: number;
  farmer: number;
  farm: number;
  policy_number: string;
  insurance_product: number;
  farm_name?: string;
  product_name?: string;
  sum_insured: number;
  premium_amount: number;
  status: string;
  quotation_date: string;
}

@Component({
  selector: 'app-create-claim',
  templateUrl: './create-claim.component.html',
  styleUrls: ['./create-claim.component.css']
})
export class CreateClaimComponent implements OnInit {

  claimForm!: FormGroup;

  farmers: Farmer[] = [];
  allQuotations: Quotation[] = [];
  filteredQuotations: Quotation[] = [];
  farmerFarms: Farm[] = [];

  selectedFarmer: Farmer | null = null;
  selectedQuotation: Quotation | null = null;
  selectedFarm: Farm | null = null;

  loading = false;
  submitting = false;
  step = 1;
  totalSteps = 3;

  lossTypes = [
    'Drought','Flood','Pest Infestation','Disease Outbreak','Hailstorm','Fire',
    'Wildlife Damage','Windstorm','Excessive Rainfall','Frost/Cold Damage',
    'Locust Attack','Other Natural Disaster'
  ];

  provinces = [
    'Eastern Province','Northern Province','Southern Province',
    'Western Province','Kigali City'
  ];

  districts: { [key: string]: string[] } = {
    'Eastern Province': ['Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Nyagatare','Rwamagana'],
    'Northern Province': ['Burera','Gakenke','Gicumbi','Musanze','Rulindo'],
    'Southern Province': ['Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango'],
    'Western Province': ['Karongi','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rusizi','Rutsiro'],
    'Kigali City': ['Gasabo','Kicukiro','Nyarugenge']
  };

  availableDistricts: string[] = [];

  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notifier: NotifierService,
    private claimService: ClaimService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  // =========================================================
  // FORM INITIALIZATION
  // =========================================================
  private initializeForm(): void {
    this.claimForm = this.fb.group({
      // Step 1 - Required
      farmer: ['', Validators.required],
      quotation: ['', Validators.required],

      // Step 2 - Required
      loss_type: ['', Validators.required],
      loss_date: ['', Validators.required],
      estimated_loss_amount: ['', [Validators.required, Validators.min(1)]],
      affected_area_size: ['', [Validators.required, Validators.min(0.1)]],
      affected_area_unit: ['Acres', Validators.required],

      // Step 3 - Required
      loss_description: ['', [Validators.required, Validators.minLength(20)]],
      immediate_cause: ['', Validators.required],
      province: ['', Validators.required],
      district: ['', Validators.required],

      // Step 3 - Optional
      sector: [''],
      witness_name: [''],
      witness_contact: [''],
      police_report_number: [''],
      supporting_documents: ['']
    });

    // Watch province changes to update districts
    this.claimForm.get('province')?.valueChanges.subscribe(province => {
      this.availableDistricts = this.districts[province] || [];
      this.claimForm.patchValue({ district: '' });
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // =========================================================
  // LOAD INITIAL DATA
  // =========================================================
  loadInitialData(): void {
    this.loading = true;

    // Load farmers
    this.http.get<any>(`${this.apiUrl}/farmers/`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.farmers = Array.isArray(res) ? res : res.results || [];
          console.log('Farmers loaded:', this.farmers.length);
        },
        error: (err) => {
          console.error('Failed to load farmers:', err);
          this.notifier.showToast({ typ: 'error', message: 'Failed to load farmers' });
        }
      });

    // Load WRITTEN quotations
    this.http.get<any>(`${this.apiUrl}/quotations/`, {
      headers: this.getHeaders(),
      params: { status: 'WRITTEN' }
    }).subscribe({
      next: (res) => {
        this.allQuotations = Array.isArray(res) ? res : res.results || [];
        console.log('Quotations loaded:', this.allQuotations.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load quotations:', err);
        this.notifier.showToast({ typ: 'error', message: 'Failed to load policies' });
        this.loading = false;
      }
    });
  }

  // =========================================================
  // EVENTS
  // =========================================================
  onFarmerSelected(): void {
    const farmerId = Number(this.claimForm.get('farmer')?.value);
    if (!farmerId) return;

    this.selectedFarmer = this.farmers.find(f => f.farmer_id === farmerId) || null;
    console.log('Selected farmer:', this.selectedFarmer);

    this.filteredQuotations = this.allQuotations.filter(q => q.farmer === farmerId);
    console.log('Filtered quotations:', this.filteredQuotations.length);

    // Load farmer's farms
    this.http.get<any>(`${this.apiUrl}/farms/`, {
      headers: this.getHeaders(),
      params: { farmer_id: farmerId.toString() }
    }).subscribe({
      next: (res) => {
        this.farmerFarms = Array.isArray(res) ? res : res.results || [];
        console.log('Farmer farms loaded:', this.farmerFarms.length);
      },
      error: (err) => {
        console.error('Failed to load farms:', err);
      }
    });

    // Reset quotation when farmer changes
    this.claimForm.patchValue({ quotation: '' });
    this.selectedQuotation = null;
    this.selectedFarm = null;
  }

  onQuotationSelected(): void {
    const qId = Number(this.claimForm.get('quotation')?.value);
    this.selectedQuotation = this.filteredQuotations.find(q => q.quotation_id === qId) || null;
    console.log('Selected quotation:', this.selectedQuotation);

    if (this.selectedQuotation) {
      this.selectedFarm = this.farmerFarms.find(f => f.farm_id === this.selectedQuotation!.farm) || null;
      console.log('Selected farm:', this.selectedFarm);

      // Pre-fill location if farm has it
      if (this.selectedFarm) {
        const province = this.selectedFarm.location_province || '';
        const district = this.selectedFarm.location_district || '';
        const sector = this.selectedFarm.location_sector || '';

        if (province) {
          this.availableDistricts = this.districts[province] || [];
        }

        this.claimForm.patchValue({
          province,
          district,
          sector
        });
      }
    }
  }

  // =========================================================
  // STEP NAVIGATION
  // =========================================================
  nextStep(): void {
    // Validate current step before proceeding
    if (this.step === 1) {
      // Check step 1 fields
      const farmer = this.claimForm.get('farmer');
      const quotation = this.claimForm.get('quotation');

      if (!farmer?.value || !quotation?.value) {
        this.notifier.showToast({
          typ: 'error',
          message: 'Please select both farmer and policy'
        });
        farmer?.markAsTouched();
        quotation?.markAsTouched();
        return;
      }
    } else if (this.step === 2) {
      // Check step 2 fields
      const step2Fields = ['loss_type', 'loss_date', 'estimated_loss_amount',
                           'affected_area_size', 'immediate_cause'];

      let hasErrors = false;
      step2Fields.forEach(field => {
        const control = this.claimForm.get(field);
        if (!control?.value || control.invalid) {
          control?.markAsTouched();
          hasErrors = true;
        }
      });

      if (hasErrors) {
        this.notifier.showToast({
          typ: 'error',
          message: 'Please fill all required fields in Step 2'
        });
        return;
      }

      // Validate loss amount doesn't exceed sum insured
      const lossAmount = Number(this.claimForm.get('estimated_loss_amount')?.value);
      const maxAmount = this.calculateMaxClaimAmount();
      if (lossAmount > maxAmount) {
        this.notifier.showToast({
          typ: 'error',
          message: `Loss amount cannot exceed sum insured (${this.formatCurrency(maxAmount)})`
        });
        return;
      }
    }

    if (this.step < this.totalSteps) {
      this.step++;
    }
  }

  previousStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  // =========================================================
  // FORM VALIDATION HELPERS
  // =========================================================
  isStepValid(stepNumber: number): boolean {
    if (stepNumber === 1) {
      return !!(this.claimForm.get('farmer')?.value && this.claimForm.get('quotation')?.value);
    } else if (stepNumber === 2) {
      const step2Fields = ['loss_type', 'loss_date', 'estimated_loss_amount',
                           'affected_area_size', 'immediate_cause'];
      return step2Fields.every(field => {
        const control = this.claimForm.get(field);
        return control?.value && control.valid;
      });
    } else if (stepNumber === 3) {
      const step3Fields = ['loss_description', 'province', 'district'];
      return step3Fields.every(field => {
        const control = this.claimForm.get(field);
        return control?.value && control.valid;
      });
    }
    return false;
  }

  // Check if form is ready for submission
  canSubmit(): boolean {
    // All required fields must be valid
    const requiredFields = [
      'farmer', 'quotation', 'loss_type', 'loss_date',
      'estimated_loss_amount', 'affected_area_size', 'immediate_cause',
      'loss_description', 'province', 'district'
    ];

    const allValid = requiredFields.every(field => {
      const control = this.claimForm.get(field);
      return control?.value && control.valid;
    });

    return allValid && !this.submitting;
  }

  // =========================================================
  // SUBMIT CLAIM
  // =========================================================
  submitClaim(): void {
    // Final validation
    if (this.claimForm.invalid) {
      this.markFormGroupTouched(this.claimForm);
      this.showValidationErrors();
      return;
    }

    // Validate loss amount
    const lossAmount = Number(this.claimForm.value.estimated_loss_amount);
    const maxAmount = this.calculateMaxClaimAmount();
    if (lossAmount > maxAmount) {
      this.notifier.showToast({
        typ: 'error',
        message: `Loss amount (${this.formatCurrency(lossAmount)}) cannot exceed sum insured (${this.formatCurrency(maxAmount)})`
      });
      return;
    }

    this.submitting = true;
    console.log('Submitting claim with form values:', this.claimForm.value);

    const v = this.claimForm.value;

    const claimRequest: ClaimCreateRequest = {
      farmer: Number(v.farmer),
      quotation: Number(v.quotation),
      claim_number: this.claimService.generateClaimNumber(Number(v.farmer)),
      estimated_loss_amount: Number(v.estimated_loss_amount),
      status: 'OPEN',
      loss_details: {
        loss_type: v.loss_type,
        loss_date: v.loss_date,
        affected_area_size: Number(v.affected_area_size),
        affected_area_unit: v.affected_area_unit,
        loss_description: v.loss_description,
        immediate_cause: v.immediate_cause,
        location: {
          province: v.province,
          district: v.district,
          sector: v.sector || ''
        },
        witness: v.witness_name ? {
          name: v.witness_name,
          contact: v.witness_contact || ''
        } : undefined,
        police_report_number: v.police_report_number || undefined
      }
    };

    console.log('Claim request payload:', claimRequest);

    this.claimService.createClaim(claimRequest).subscribe({
      next: (res) => {
        this.submitting = false;
        console.log('Claim created successfully:', res);

        this.notifier.showSweetAlert({
          typ: 'success',
          message: `Claim ${res.claim_number} created successfully!`
        });

        // Reset form and go back to step 1
        this.resetForm();
      },
      error: (err) => {
        this.submitting = false;
        console.error('Failed to create claim:', err);

        const errorMessage = err.error?.detail ||
                           err.error?.message ||
                           err.message ||
                           'Failed to create claim. Please try again.';

        this.notifier.showSweetAlert({
          typ: 'error',
          message: errorMessage
        });
      }
    });
  }

  // =========================================================
  // VALIDATION HELPERS
  // =========================================================
  showValidationErrors(): void {
    const errors: string[] = [];

    const requiredFields = {
      farmer: 'Farmer',
      quotation: 'Policy',
      loss_type: 'Loss Type',
      loss_date: 'Loss Date',
      estimated_loss_amount: 'Estimated Loss Amount',
      affected_area_size: 'Affected Area Size',
      immediate_cause: 'Immediate Cause',
      loss_description: 'Loss Description',
      province: 'Province',
      district: 'District'
    };

    Object.entries(requiredFields).forEach(([key, label]) => {
      const control = this.claimForm.get(key);
      if (!control?.value) {
        errors.push(`${label} is required`);
      } else if (control.invalid) {
        if (control.hasError('minLength')) {
          errors.push(`${label} must be at least ${control.errors?.['minLength'].requiredLength} characters`);
        } else if (control.hasError('min')) {
          errors.push(`${label} must be greater than ${control.errors?.['min'].min}`);
        }
      }
    });

    if (errors.length > 0) {
      const message = errors.length === 1
        ? errors[0]
        : `Please fix the following:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`;

      this.notifier.showToast({ typ: 'error', message });
    } else {
      this.notifier.showToast({ typ: 'error', message: 'Please fill all required fields correctly' });
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const f = this.claimForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  // =========================================================
  // UTILITY FUNCTIONS
  // =========================================================
  getMaxLossDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  calculateMaxClaimAmount(): number {
    return this.selectedQuotation?.sum_insured || 0;
  }

  formatCurrency(value: number | string): string {
    if (!value) return "RWF 0";
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  resetForm(): void {
    this.claimForm.reset({
      affected_area_unit: 'Acres' // Reset to default value
    });
    this.step = 1;
    this.selectedFarmer = null;
    this.selectedQuotation = null;
    this.selectedFarm = null;
    this.filteredQuotations = [];
    this.farmerFarms = [];
    this.availableDistricts = [];
    this.loadInitialData();
  }

  // =========================================================
  // DEBUG HELPERS (Remove in production)
  // =========================================================
  logFormStatus(): void {
    console.log('Form valid:', this.claimForm.valid);
    console.log('Form value:', this.claimForm.value);
    console.log('Form errors:', this.getFormErrors());
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.claimForm.controls).forEach(key => {
      const control = this.claimForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}
