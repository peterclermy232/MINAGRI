// pages-register.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize, first } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { ApiService, Organization } from 'src/app/shared/api.service';

@Component({
  selector: 'app-pages-register',
  templateUrl: './pages-register.component.html',
  styleUrls: ['./pages-register.component.css']
})
export class PagesRegisterComponent implements OnInit {
  registerForm: FormGroup;
  formSubmitted = false;
  registerBtn = {
    loading: false,
    text: 'Create Account',
  };
  organizations: Organization[] = [];
  countries: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      user_email: ['', [Validators.required, Validators.email]],
      user_phone_number: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      organisation_id: [''],
      terms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadCountries();
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  loadOrganizations(): void {
    this.apiService.getOrganizations().subscribe({
      next: (orgs: Organization[]) => {
        this.organizations = orgs;
        console.log('Organizations loaded:', orgs);
      },
      error: (err) => {
        console.error('Error loading organizations:', err);
      }
    });
  }

  loadCountries(): void {
    this.http
    .get('/api/countries/?all=true').subscribe({
      next: (response: any) => {
        this.countries = response.results || response;
      },
      error: (err) => {
        console.error('Error loading countries:', err);
      }
    });
  }

  handleSubmit(): void {
    this.formSubmitted = true;

    if (this.registerForm.invalid) {
      this.showToast('error', 'Please fill in all required fields correctly.');
      return;
    }

    this.handleRegister();
  }

  handleRegister(): void {
    this.registerBtn = {
      text: 'Creating Account...',
      loading: true,
    };

    // Prepare registration data
    const registrationData = {
      user_email: this.registerForm.get('user_email')!.value,
      password: this.registerForm.get('password')!.value,
      first_name: this.registerForm.get('first_name')!.value,
      last_name: this.registerForm.get('last_name')!.value,
      user_name: `${this.registerForm.get('first_name')!.value}.${this.registerForm.get('last_name')!.value}`,
      user_phone_number: this.registerForm.get('user_phone_number')!.value,
      organisation_id: this.registerForm.get('organisation_id')!.value,
    };

    this.http
      .post(`${environment.authUrl}/register/`, registrationData)
      .pipe(
        finalize(() => {
          this.registerBtn = {
            text: 'Create Account',
            loading: false,
          };
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          this.resetForm();

          Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'Your account has been created. You will be redirected to the dashboard.',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            // User is automatically logged in after registration
            // Token is already stored by the backend response
            localStorage.setItem('userToken', JSON.stringify({
              userToken: response.token,
              refreshToken: response.refresh,
              expiry: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
            }));

            this.router.navigate(['/login']);
          });
        },
        error: (err: any) => {
          console.error('Registration error:', err);
          this.handleRegistrationError(err);
        }
      });
  }

  handleRegistrationError(err: any): void {
    let errorMessage = 'Registration failed. Please try again.';

    try {
      if (err?.error?.error) {
        errorMessage = err.error.error;
      } else if (err?.error?.user_email) {
        errorMessage = 'This email is already registered.';
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (err?.status === 400) {
        errorMessage = 'Invalid registration data. Please check your inputs.';
      } else if (err?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    } catch (e) {
      console.error('Error parsing error message:', e);
    }

    this.showToast('error', errorMessage);
  }

  resetForm(): void {
    this.registerForm.reset();
    this.registerForm.markAsPristine();
    this.registerForm.markAsUntouched();
    this.formSubmitted = false;
  }

  showToast(icon: 'success' | 'error' | 'warning' | 'info', title: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: icon,
      title: title,
    });
  }

  // Getter for easy access to form controls in template
  get f() {
    return this.registerForm.controls;
  }
}
