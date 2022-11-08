import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { UserService } from '../../shared/user.service';
import { OrganizationService } from '../../app/shared/organization.service';
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
  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  // handleLogin(){
  //   this.router.navigateByUrl('/home')
  // }
  handleSubmit() {
    this.formSubmitted = false;
    if (this.loginForm.invalid) {
      this.formSubmitted = true;
      return;
    }
    this.handleLogin();
  }

  handleLogin() {
    this.loginBtn = {
      text: 'Processing...',
      loading: true,
    };
    this.authService
      .appUserLogin({
        username: this.loginForm.get('username')!.value,
        password: this.loginForm.get('password')!.value,
      })
      .pipe(
        finalize(() => {
          this.loginBtn = {
            text: 'Login',
            loading: false,
          };
        })
      )
      .subscribe(
        (resp) => {
          console.log('login resp', resp);
          this.resetForm();
          this.showToast();
        },
        (err) => {
          console.log('err login', err.error);
          this.handleLoginError(err);
        }
      );
  }

  async handleLoginError(err: {
    error: { description: string; message: string };
  }) {
    if (
      err &&
      err.error.description &&
      this.isWs02TokenInvalid(err.error.description)
    ) {
      await this.authService.removeApiUserToken();
      this.handleLogin();
    } else {
      this.showErrorMessage(err.error);
    }
  }

  isWs02TokenInvalid(errorMessage: string) {
    console.log('error message', errorMessage);
    return errorMessage.includes('Invalid JWT token');
  }

  showErrorMessage(err: any) {
    const message =
      err.message.message ||
      err.description ||
      'error occurred, try again later';
    Swal.fire('Error Occurred!', message, 'error');
  }

  resetForm() {
    this.loginForm.reset();
    this.loginForm.markAsPristine();
    this.formSubmitted = false;
  }

  showToast() {
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
