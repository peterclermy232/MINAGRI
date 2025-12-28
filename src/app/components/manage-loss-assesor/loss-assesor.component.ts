import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LossAssessorService } from 'src/app/shared/loss.service';
import { UserService } from 'src/app/shared/user.service';
import { OrganizationService } from 'src/app/shared/organization.service';
import { NotifierService } from 'src/app/services/notifier.service';
import { finalize } from 'rxjs';

interface LossAssessor {
  assessor_id: number;
  user: number;
  user_name?: string;
  organisation: number;
  organisation_name?: string;
  status: string;
  practice_number?: string;
  date_time_added?: string;
}

interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
}

@Component({
  selector: 'app-loss-assesor',
  templateUrl: './loss-assesor.component.html',
  styleUrls: ['./loss-assesor.component.css']
})
export class LossAssesor implements OnInit {
  formValue!: FormGroup;
  lossAssessors: LossAssessor[] = [];
  filteredAssessors: LossAssessor[] = [];
  users: User[] = [];
  organizations: any[] = [];

  selectedAssessor: LossAssessor | null = null;
  showAdd: boolean = false;
  showUpdate: boolean = false;
  isLoading: boolean = false;
  searchText: string = '';

  statusOptions = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

  constructor(
    private fb: FormBuilder,
    private api: LossAssessorService,
    private userService: UserService,
    private orgService: OrganizationService,
    private notifier: NotifierService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
    this.loadOrganizations();
    this.loadAllAssessors();
  }

  initializeForm(): void {
    this.formValue = this.fb.group({
      user: ['', Validators.required],
      organisation: ['', Validators.required],
      practice_number: ['', [Validators.required, Validators.minLength(3)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        // Get users with ASSESSOR role or all users
        const usersArray = res.usersResponse || res.results || res;
        this.users = usersArray.filter((u: User) =>
          u.user_role === 'ASSESSOR' || u.user_role === 'ADMIN'
        );
        console.log('Eligible users loaded:', this.users.length);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.notifier.showSweetAlert({
          typ: 'error',
          message: 'Failed to load users'
        });
      }
    });
  }

  loadOrganizations(): void {
    this.orgService.getOrganizations().subscribe({
      next: (res: any) => {
        this.organizations = res.orgsResponse?.results || res.results || res;
        console.log('Organizations loaded:', this.organizations.length);
      },
      error: (err) => {
        console.error('Error loading organizations:', err);
      }
    });
  }

  loadAllAssessors(): void {
    this.isLoading = true;
    this.api.getAllLossAssessors()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res: any) => {
          this.lossAssessors = res.results || res;
          this.filteredAssessors = [...this.lossAssessors];
          console.log('Loss assessors loaded:', this.lossAssessors.length);
        },
        error: (err) => {
          console.error('Error loading assessors:', err);
          this.notifier.showSweetAlert({
            typ: 'error',
            message: 'Failed to load loss assessors'
          });
        }
      });
  }

  clickAddEmployee(): void {
    this.showAdd = true;
    this.showUpdate = false;
    this.selectedAssessor = null;
    this.formValue.reset({ status: 'ACTIVE' });
  }

  postEmployeeDetails(): void {
    if (this.formValue.invalid) {
      this.notifier.showSweetAlert({
        typ: 'error',
        message: 'Please fill all required fields'
      });
      return;
    }

    this.isLoading = true;

    const payload = {
      user: parseInt(this.formValue.value.user),
      organisation: parseInt(this.formValue.value.organisation),
      practice_number: this.formValue.value.practice_number,
      status: this.formValue.value.status
    };

    this.api.createLossAssessor(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          this.notifier.showSweetAlert({
            typ: 'success',
            message: 'Loss Assessor added successfully!',
            timer: true
          });
          this.closeModal();
          this.loadAllAssessors();
        },
        error: (err) => {
          console.error('Error creating assessor:', err);
          const errorMsg = err.error?.detail || err.error?.message || 'Failed to add assessor';
          this.notifier.showSweetAlert({
            typ: 'error',
            message: errorMsg
          });
        }
      });
  }

  onEdit(assessor: LossAssessor): void {
    this.showAdd = false;
    this.showUpdate = true;
    this.selectedAssessor = assessor;

    this.formValue.patchValue({
      user: assessor.user,
      organisation: assessor.organisation,
      practice_number: assessor.practice_number || '',
      status: assessor.status
    });
  }

  updateEmployeeDetails(): void {
    if (this.formValue.invalid || !this.selectedAssessor) {
      this.notifier.showSweetAlert({
        typ: 'error',
        message: 'Please fill all required fields'
      });
      return;
    }

    this.isLoading = true;

    const payload = {
      user: parseInt(this.formValue.value.user),
      organisation: parseInt(this.formValue.value.organisation),
      practice_number: this.formValue.value.practice_number,
      status: this.formValue.value.status
    };

    this.api.updateLossAssessor(this.selectedAssessor.assessor_id, payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          this.notifier.showSweetAlert({
            typ: 'success',
            message: 'Loss Assessor updated successfully!',
            timer: true
          });
          this.closeModal();
          this.loadAllAssessors();
        },
        error: (err) => {
          console.error('Error updating assessor:', err);
          const errorMsg = err.error?.detail || 'Failed to update assessor';
          this.notifier.showSweetAlert({
            typ: 'error',
            message: errorMsg
          });
        }
      });
  }

  deleteAssessor(assessor: LossAssessor): void {
    if (!confirm(`Are you sure you want to delete assessor "${assessor.user_name}"?`)) {
      return;
    }

    this.isLoading = true;

    this.api.deleteLossAssessor(assessor.assessor_id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.notifier.showSweetAlert({
            typ: 'success',
            message: 'Loss Assessor deleted successfully!',
            timer: true
          });
          this.loadAllAssessors();
        },
        error: (err) => {
          console.error('Error deleting assessor:', err);
          this.notifier.showSweetAlert({
            typ: 'error',
            message: 'Failed to delete assessor'
          });
        }
      });
  }

  onSearch(): void {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.filteredAssessors = [...this.lossAssessors];
      return;
    }

    this.filteredAssessors = this.lossAssessors.filter(assessor =>
      assessor.user_name?.toLowerCase().includes(search) ||
      assessor.organisation_name?.toLowerCase().includes(search) ||
      assessor.practice_number?.toLowerCase().includes(search) ||
      assessor.status.toLowerCase().includes(search)
    );
  }

  closeModal(): void {
    this.formValue.reset({ status: 'ACTIVE' });
    this.showAdd = false;
    this.showUpdate = false;
    this.selectedAssessor = null;

    const modalElement = document.getElementById('cancel');
    modalElement?.click();
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'badge bg-success';
      case 'INACTIVE': return 'badge bg-secondary';
      case 'SUSPENDED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.user_id === userId);
    return user ? user.user_name : 'Unknown';
  }

  getOrganizationName(orgId: number): string {
    const org = this.organizations.find(o => o.organisation_id === orgId);
    return org ? org.organisation_name : 'Unknown';
  }
}
