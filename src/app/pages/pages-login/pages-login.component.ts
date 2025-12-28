import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pages-login',
  templateUrl: './pages-login.component.html',
  styleUrls: ['./pages-login.component.css'],
})
export class PagesLoginComponent implements OnInit {
  loginForm: FormGroup;
  formSubmitted = false;
  loginBtn = {
    loading: false,
    text: 'Login',
  };

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isloggedInUserTokenUsable()) {
      this.router.navigate(['/dashboard']);
    }
  }

  handleSubmit(): void {
    this.formSubmitted = true;

    if (this.loginForm.invalid) {
      this.showToast('error', 'Please fill in all required fields.');
      return;
    }

    this.handleLogin();
  }

  handleLogin(): void {
  this.loginBtn = {
    text: 'Processing...',
    loading: true,
  };

  const username = this.loginForm.get('username')!.value.trim();
  const password = this.loginForm.get('password')!.value;

  this.authService
    .appUserLogin(username, password)
    .pipe(
      finalize(() => {
        this.loginBtn = {
          text: 'Login',
          loading: false,
        };
      })
    )
    .subscribe({
      next: (token: string) => {
        console.log('Login successful');
        this.resetForm();
        this.showToast('success', 'Successfully logged in!');

        // Redirect to the attempted URL or dashboard
        const redirectUrl = this.authService.redirectUrl || '/dashboard';
        this.router.navigate([redirectUrl]);
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.handleLoginError(err);
      }
    });
}

  handleLoginError(err: any): void {
    let errorMessage = 'An error occurred during login. Please try again.';

    try {
      if (err?.error?.error) {
        errorMessage = err.error.error;
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (err?.error?.detail) {
        errorMessage = err.error.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (err?.status === 401) {
        errorMessage = 'Invalid username or password. Please try again.';
      } else if (err?.status === 403) {
        errorMessage = 'Your account is inactive. Please contact support.';
      } else if (err?.status === 404) {
        errorMessage = 'Login service not found. Please contact support.';
      } else if (err?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    } catch (e) {
      console.error('Error parsing error message:', e);
    }

    this.showToast('error', errorMessage);
  }

  resetForm(): void {
    this.loginForm.reset();
    this.loginForm.markAsPristine();
    this.loginForm.markAsUntouched();
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
    return this.loginForm.controls;
  }
}
