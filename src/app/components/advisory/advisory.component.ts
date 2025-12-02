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

  editAdvisoryId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private advisoryService: AdvisoryService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadLists();
    this.loadAdvisories();
    this.minDateTime = this.formatDateTimeLocal(new Date());
  }

  // ---------------------------------------------------
  // FORM INITIALIZATION
  // ---------------------------------------------------
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

    // Update estimated recipients whenever form changes
    this.formValue.valueChanges.subscribe(() => {
      this.updateRecipientCount();
    });
  }

  // ---------------------------------------------------
  // LOAD STATIC LISTS
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // LOAD ADVISORIES
  // ---------------------------------------------------
  loadAdvisories(): void {
    this.isLoading = true;

    this.advisoryService.getAdvisories().subscribe(data => {
      this.advisories = data;
      this.advisoryData = data;
      this.filteredAdvisories = [...data];
      this.isLoading = false;
    });
  }

  // ---------------------------------------------------
  // SEARCH
  // ---------------------------------------------------
  searchAdvisories(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredAdvisories = this.advisories.filter(a =>
      (a.province ?? '').toLowerCase().includes(term) ||
      (a.district ?? '').toLowerCase().includes(term) ||
      (a.sector ?? '').toLowerCase().includes(term) ||
      (a.message ?? '').toLowerCase().includes(term)
    );
  }

  // ---------------------------------------------------
  // ADD ADVISORY
  // ---------------------------------------------------
  clickAddAdvisory(): void {
    this.showAdd = true;
    this.showUpdate = false;
    this.formSubmitted = false;
    this.editAdvisoryId = null;

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

    const payload = {
      province: formData.province,
      district: formData.district,
      sector: formData.sector,
      gender: formData.gender,
      policyStatus: formData.policyStatus,
      message: formData.message,
      send_now: formData.sendNow,
      scheduled_date_time: formData.sendNow ? null : formData.scheduledDateTime,
      status: formData.sendNow ? 'Sent' : 'Scheduled',
      recipients_count: this.estimatedRecipients
    };

    this.advisoryService.createAdvisory(payload).subscribe(() => {
      this.isSending = false;
      this.showAdd = false;
      this.loadAdvisories();
      this.formValue.reset();
      alert('Advisory saved successfully!');
    });
  }

  // ---------------------------------------------------
  // ESTIMATE RECIPIENT COUNT
  // ---------------------------------------------------
  updateRecipientCount(): void {
    const filters = {
      province: this.formValue.get('province')?.value,
      district: this.formValue.get('district')?.value,
      sector: this.formValue.get('sector')?.value,
      gender: this.formValue.get('gender')?.value,
      policyStatus: this.formValue.get('policyStatus')?.value
    };

    this.advisoryService.estimateRecipients(filters).subscribe(count => {
      this.estimatedRecipients = count;
    });
  }

  // ---------------------------------------------------
  // DELETE ADVISORY
  // ---------------------------------------------------
  deleteAdvisory(advisory: Advisory): void {
    if (!confirm(`Are you sure you want to delete this advisory?`)) return;

    this.advisoryService.deleteAdvisory(advisory.id!).subscribe(() => {
      this.advisories = this.advisories.filter(a => a.id !== advisory.id);
      this.filteredAdvisories = this.filteredAdvisories.filter(a => a.id !== advisory.id);
      alert('Advisory deleted successfully!');
    });
  }

  // ---------------------------------------------------
  // EDIT ADVISORY
  // ---------------------------------------------------
  onEdit(advisory: Advisory): void {
    this.showAdd = false;
    this.showUpdate = true;
    this.formSubmitted = false;

    this.editAdvisoryId = advisory.id!;

    this.formValue.patchValue({
      province: advisory.province,
      district: advisory.district,
      sector: advisory.sector,
      gender: advisory.gender,
      policyStatus: advisory.policyStatus,
      message: advisory.message,
      sendNow: advisory.send_now,
      scheduledDateTime: advisory.scheduled_date_time
        ? this.formatDateTimeLocal(new Date(advisory.scheduled_date_time))
        : ''
    });

    const modal = document.getElementById('advisoryModal');
    modal?.classList.add('show');
    modal?.setAttribute('style', 'display: block;');
  }

  // ---------------------------------------------------
  // UPDATE ADVISORY
  // ---------------------------------------------------
  updateAdvisory(): void {
    if (!this.editAdvisoryId) return;
    this.formSubmitted = true;
    if (this.formValue.invalid) return;

    const formData = this.formValue.value;

    const payload = {
      province: formData.province,
      district: formData.district,
      sector: formData.sector,
      gender: formData.gender,
      policyStatus: formData.policyStatus,
      message: formData.message,
      send_now: formData.sendNow,
      scheduled_date_time: formData.sendNow ? null : formData.scheduledDateTime,
      recipients_count: this.estimatedRecipients
    };

    this.advisoryService.updateAdvisory(this.editAdvisoryId, payload).subscribe(() => {
      this.showUpdate = false;
      this.loadAdvisories();
      alert('Advisory updated successfully!');
    });
  }

  // ---------------------------------------------------
  // RESEND ADVISORY
  // ---------------------------------------------------
  resendAdvisory(advisory: Advisory): void {
    if (!confirm('Are you sure you want to resend this advisory?')) return;

    this.advisoryService.sendAdvisory({ id: advisory.id }).subscribe(() => {
      alert('Advisory resent successfully!');
      this.loadAdvisories();
    });
  }

  // ---------------------------------------------------
  // HELPERS
  // ---------------------------------------------------
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Sent': return 'badge bg-success';
      case 'Scheduled': return 'badge bg-warning';
      case 'Draft': return 'badge bg-secondary';
      default: return 'badge bg-info';
    }
  }

  getTotalRecipients(): number {
    return this.advisoryData.reduce((sum, a) => sum + (a.recipients_count ?? 0), 0);
  }

  formatDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  exportToCSV(): void {
    const headers = ['ID', 'Date Time Added', 'Province', 'District', 'Sector', 'Gender', 'Policy Status', 'Message', 'Status', 'Recipients Count', 'Sent Date Time'];
    const rows = this.advisoryData.map(a => [
      a.id,
      a.date_time_added ? new Date(a.date_time_added).toLocaleString() : '',
      a.province,
      a.district,
      a.sector,
      a.gender,
      a.policyStatus,
      a.message,
      a.status,
      a.recipients_count,
      a.sent_date_time ? new Date(a.sent_date_time).toLocaleString() : ''
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    rows.forEach(rowArray => {
      const row = rowArray.join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'advisory_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
