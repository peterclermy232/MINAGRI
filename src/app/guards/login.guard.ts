import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isloggedInUserTokenUsable()) {
      // User is already logged in, redirect to dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
