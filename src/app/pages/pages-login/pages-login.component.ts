import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
//import { OrganizationService } from '../../shared/organization.service';
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
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  handleSubmit(): void {
    this.formSubmitted = false;
    if (this.loginForm.invalid) {
      this.formSubmitted = true;
      return;
    }
    this.handleLogin();
  }

  // handleLogin(): void {
  //   this.loginBtn = {
  //     text: 'Processing...',
  //     loading: true,
  //   };
  //   this.authService
  //     .appUserLogin({
  //       username: this.loginForm.get('username')!.value,
  //       password: this.loginForm.get('password')!.value,
  //     })
  //     .pipe(
  //       finalize(() => {
  //         this.loginBtn = {
  //           text: 'Login',
  //           loading: false,
  //         };
  //       })
  //     )
  //     .subscribe(
  //       (resp: any) => {
  //         console.log('login resp', resp);

  //         // Store authentication data if needed
  //         if (resp.token || resp.access_token) {
  //           localStorage.setItem('token', resp.token || resp.access_token);
  //         }
  //         if (resp.user) {
  //           localStorage.setItem('user', JSON.stringify(resp.user));
  //         }

  //         this.resetForm();
  //         this.showToast();

  //         // Navigate to dashboard or home after successful login
  //         // Uncomment and adjust route as needed
  //          this.router.navigate(['/dashboard']);
  //       },
  //       (err: any) => {
  //         console.log('err login', err);
  //         this.handleLoginError(err);
  //       }
  //     );
  // }

  handleLogin(): void {
  this.loginBtn = {
    text: 'Processing...',
    loading: true,
  };

  // 🚀 Skip any validation or API call — just navigate
  setTimeout(() => {
    this.loginBtn = {
      text: 'Login',
      loading: false,
    };

    // Show success toast
    this.showToast();

    // Navigate directly to dashboard
    this.router.navigate(['/dashboard']);
  }, 1000); // optional short delay for UI feedback
}


  async handleLoginError(err: any): Promise<void> {
    try {
      // Check if error exists and has the expected structure
      if (
        err?.error?.description &&
        this.isWs02TokenInvalid(err.error.description)
      ) {
        await this.authService.removeApiUserToken();
        this.handleLogin();
      } else {
        this.showErrorMessage(err?.error || err);
      }
    } catch (error) {
      console.error('Error handling login error:', error);
      this.showErrorMessage({
        message: 'An unexpected error occurred. Please try again.'
      });
    }
  }

  isWs02TokenInvalid(errorMessage: string): boolean {
    console.log('error message', errorMessage);
    return errorMessage?.includes('Invalid JWT token') || false;
  }

  showErrorMessage(err: any): void {
    // Safely extract error message with multiple fallbacks
    let message = 'An error occurred, please try again later';

    try {
      if (err) {
        // Try different error message locations
        if (err.message?.message) {
          message = err.message.message;
        } else if (err.message) {
          message = typeof err.message === 'string' ? err.message : message;
        } else if (err.description) {
          message = err.description;
        } else if (err.error?.message) {
          message = err.error.message;
        } else if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
          message = err.errors[0]?.message || message;
        }
      }
    } catch (e) {
      console.error('Error parsing error message:', e);
    }

    Swal.fire('Error Occurred!', message, 'error');
  }

  resetForm(): void {
    this.loginForm.reset();
    this.loginForm.markAsPristine();
    this.formSubmitted = false;
  }

  showToast(): void {
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
      icon: 'success',
      title: 'Successfully logged in!',
    });
  }
}
