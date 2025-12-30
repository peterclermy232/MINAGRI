// pages-register.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
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
  availableRoles: any[] = [];
  showRoleField = false; // Control visibility of role field

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      user_phone_number: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      organisation_id: [''],
      user_role: ['CUSTOMER'], // Default role
      terms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadAvailableRoles();
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

  loadAvailableRoles(): void {
    this.http.get(`${environment.authUrl}/register/`).subscribe({
      next: (response: any) => {
        this.availableRoles = response.available_roles || [];
        console.log('Available roles:', this.availableRoles);
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        // Fallback to common roles if API fails
        this.availableRoles = [
          { role_name: 'CUSTOMER', role_description: 'Customer' },
          { role_name: 'AGENT', role_description: 'Agent' },
          { role_name: 'USER', role_description: 'User' }
        ];
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

    // Prepare registration data to match backend serializer
    const registrationData = {
      email: this.registerForm.get('email')!.value,
      password: this.registerForm.get('password')!.value,
      first_name: this.registerForm.get('first_name')!.value,
      last_name: this.registerForm.get('last_name')!.value,
      user_phone_number: this.registerForm.get('user_phone_number')!.value || '',
      organisation_id: this.registerForm.get('organisation_id')!.value || null,
      user_role: this.registerForm.get('user_role')!.value || 'CUSTOMER'
    };

    // Remove empty/null values
    Object.keys(registrationData).forEach(key => {
      if (registrationData[key as keyof typeof registrationData] === '' ||
          registrationData[key as keyof typeof registrationData] === null) {
        delete registrationData[key as keyof typeof registrationData];
      }
    });

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
            text: 'Your account has been created. Redirecting to login...',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            // Store tokens if backend returns them
            if (response.token && response.refresh) {
              localStorage.setItem('userToken', JSON.stringify({
                userToken: response.token,
                refreshToken: response.refresh,
                expiry: new Date(Date.now() + 3600000).toISOString()
              }));

              // Redirect to dashboard if logged in automatically
              this.router.navigate(['/']);
            } else {
              // Redirect to login page
              this.router.navigate(['/login']);
            }
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
      if (err?.error?.errors) {
        // Handle serializer errors
        const errors = err.error.errors;
        const errorMessages = [];

        for (const field in errors) {
          if (errors.hasOwnProperty(field)) {
            const fieldErrors = errors[field];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(...fieldErrors);
            } else {
              errorMessages.push(fieldErrors);
            }
          }
        }

        errorMessage = errorMessages.join('. ');
      } else if (err?.error?.error) {
        errorMessage = err.error.error;
      } else if (err?.error?.email) {
        errorMessage = Array.isArray(err.error.email)
          ? err.error.email[0]
          : err.error.email;
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
    this.registerForm.reset({
      user_role: 'CUSTOMER' // Reset to default role
    });
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
