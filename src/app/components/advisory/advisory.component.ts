import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdvisoryService, Advisory } from 'src/app/shared/advisory.service';

@Component({
  selector: 'app-advisory',
  templateUrl: './advisory.component.html',
  styleUrls: ['./advisory.component.css']
})
export class AdvisoryComponent implements OnInit {

  formValue!: FormGroup;
  formSubmitted = false;

  advisories: Advisory[] = [];
  filteredAdvisories: Advisory[] = [];

  provinces: string[] = [];
  districts: string[] = [];
  sectors: string[] = [];
  policyStatuses: string[] = [];
  genders = ['Male', 'Female', 'All'];

  searchTerm: string = '';
  isLoading: boolean = false;
  isSending: boolean = false;

  page = 1;
  pageSize = 10;

  showAdd = false;
  showUpdate = false;
  minDateTime!: string;
  estimatedRecipients: number = 0;
  advisoryData: Advisory[] = [];
  constructor(
    private fb: FormBuilder,
    private advisoryService: AdvisoryService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadLists();
    this.loadAdvisories();
    this.minDateTime = this.formatDateTimeLocal(new Date());
  }

  initializeForm(): void {
    this.formValue = this.fb.group({
      province: ['', Validators.required],
      district: ['', Validators.required],
      sector: ['', Validators.required],
      gender: ['', Validators.required],
      policyStatus: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      sendNow: [true],
      scheduledDateTime: ['']
    });

    // Update estimated recipients whenever a relevant field changes
    this.formValue.valueChanges.subscribe(() => {
      this.updateRecipientCount();
    });
  }

  loadLists(): void {
    this.advisoryService.getProvinces().subscribe(res => this.provinces = res);
    this.advisoryService.getSectors().subscribe(res => this.sectors = res);
    this.advisoryService.getPolicyStatuses().subscribe(res => this.policyStatuses = res);
  }

  onProvinceChange(): void {
    const province = this.formValue.get('province')?.value;
    this.advisoryService.getDistricts(province).subscribe(res => {
      this.districts = res;
      this.formValue.get('district')?.setValue('');
    });
  }

  loadAdvisories(): void {
    this.isLoading = true;
    this.advisoryService.getAdvisories().subscribe(data => {
      this.advisoryData = data;
      this.advisories = data;               // keep full list for search
      this.filteredAdvisories = [...data];   // initialize filtered list
      this.isLoading = false;
    });
  }

  searchAdvisories(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredAdvisories = this.advisories.filter(a =>
      a.province.toLowerCase().includes(term) ||
      a.district.toLowerCase().includes(term) ||
      a.sector.toLowerCase().includes(term) ||
      a.message.toLowerCase().includes(term)
    );
  }

  clickAddAdvisory(): void {
    this.showAdd = true;
    this.showUpdate = false;
    this.formSubmitted = false;

    this.formValue.reset({
      sendNow: true,
      gender: 'All',
      policyStatus: 'All'
    });
  }

  async sendAdvisory(): Promise<void> {
    this.formSubmitted = true;

    if (this.formValue.invalid) return;

    this.isSending = true;

    const formData = this.formValue.value;

    const newAdvisoryPayload = {
      province: formData.province,
      district: formData.district,
      sector: formData.sector,
      gender: formData.gender,
      policyStatus: formData.policyStatus,
      message: formData.message,
      sendNow: formData.sendNow,
      scheduledDateTime: formData.sendNow ? null : formData.scheduledDateTime,
      status: (formData.sendNow ? 'Sent' : 'Scheduled') as 'Sent' | 'Scheduled' | 'Draft',
      recipientsCount: this.estimatedRecipients
    };

    this.advisoryService.createAdvisory(newAdvisoryPayload).subscribe(res => {
      this.isSending = false;
      this.showAdd = false;
      this.loadAdvisories();
      this.formValue.reset();
      alert('Advisory saved successfully!');
    });
  }

  updateRecipientCount(): void {
    const filters = {
      province: this.formValue.get('province')?.value,
      district: this.formValue.get('district')?.value,
      sector: this.formValue.get('sector')?.value,
      gender: this.formValue.get('gender')?.value,
      policyStatus: this.formValue.get('policyStatus')?.value
    };

    this.advisoryService.getRecipientCount(filters).subscribe(count => {
      this.estimatedRecipients = count;
    });
  }

  exportData(): void {
    this.advisoryService.exportAdvisories(this.filteredAdvisories);
  }

  formatDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  deleteAdvisory(advisory: Advisory): void {
    if (!confirm(`Are you sure you want to delete this advisory?`)) return;

    this.advisoryService.deleteAdvisory(advisory.id).subscribe(success => {
      if (success) {
        this.advisories = this.advisories.filter(a => a.id !== advisory.id);
        this.filteredAdvisories = this.filteredAdvisories.filter(a => a.id !== advisory.id);
        alert('Advisory deleted successfully!');
      } else {
        alert('Failed to delete advisory.');
      }
    });
  }

  // ---------------------- EDIT ADVISORY -------------------------
onEdit(advisory: Advisory): void {
  this.showAdd = false;
  this.showUpdate = true;
  this.formSubmitted = false;

  this.formValue.patchValue({
    province: advisory.province,
    district: advisory.district,
    sector: advisory.sector,
    gender: advisory.gender,
    policyStatus: advisory.policyStatus,
    message: advisory.message,
    sendNow: advisory.sendNow,
    scheduledDateTime: advisory.scheduledDateTime ? this.formatDateTimeLocal(new Date(advisory.scheduledDateTime)) : ''
  });

  // Optionally open modal if not using data-bs-toggle
  const modal = document.getElementById('advisoryModal');
  modal?.classList.add('show');
  modal?.setAttribute('style', 'display: block;');
}

// ---------------------- RESEND ADVISORY -------------------------
resendAdvisory(advisory: Advisory): void {
  if (!confirm('Are you sure you want to resend this advisory?')) return;

  this.advisoryService.sendAdvisory(advisory.id).subscribe(success => {
    if (success) {
      alert('Advisory resent successfully!');
      this.loadAdvisories();
    } else {
      alert('Failed to resend advisory.');
    }
  });
}


  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Sent': return 'badge bg-success';
      case 'Scheduled': return 'badge bg-warning';
      case 'Draft': return 'badge bg-secondary';
      default: return 'badge bg-info';
    }
  }
  getTotalRecipients(): number {
  return this.advisoryData.reduce((sum, a) => sum + a.recipientsCount, 0);
}
}
