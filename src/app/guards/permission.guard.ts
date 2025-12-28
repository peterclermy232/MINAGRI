import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { PermissionService } from '../shared/permission.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // First check if user is authenticated
    if (!this.authService.isloggedInUserTokenUsable()) {
      this.authService.redirectUrl = state.url;
      this.router.navigate(['/login']);
      return false;
    }

    // Check for required permission in route data
    const requiredPermission = route.data['permission'];
    const requiredRole = route.data['role'];

    // If no permission/role requirement specified, allow access
    if (!requiredPermission && !requiredRole) {
      return true;
    }

    // Check role if specified
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!this.permissionService.hasRole(...roles)) {
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    // Check permission if specified
    if (requiredPermission) {
      const [resource, action] = requiredPermission.split(':');
      if (!this.permissionService.hasPermission(resource, action)) {
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}
