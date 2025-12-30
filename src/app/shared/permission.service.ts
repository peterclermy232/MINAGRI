import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserPermissions {
  [resource: string]: string[];
}

export interface UserRole {
  role_name: string;
  permissions: UserPermissions;
  is_system_role: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissionsSubject = new BehaviorSubject<UserPermissions>({});
  public permissions$ = this.permissionsSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string>('');
  public userRole$ = this.userRoleSubject.asObservable();

  constructor() {
    this.loadPermissionsFromStorage();
  }

  /**
   * Load permissions from localStorage (set during login)
   */
  private loadPermissionsFromStorage(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.setUserRole(user.user_role);

        // Try to load permissions from storage
        const storedPermissions = localStorage.getItem('user_role_permissions');
        if (storedPermissions) {
          const permissions = JSON.parse(storedPermissions);
          this.permissionsSubject.next(permissions);
          console.log('✓ Loaded permissions from storage:', permissions);
        } else {
          // Load default permissions if not in storage
          this.loadRolePermissions(user.user_role);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  }

  /**
   * Set user role
   */
  setUserRole(role: string): void {
    this.userRoleSubject.next(role);
    console.log('✓ User role set to:', role);
  }

  /**
   * Get current user role
   */
  getUserRole(): string {
    return this.userRoleSubject.value;
  }

  /**
   * Load role permissions from localStorage or API
   */
  loadRolePermissions(roleName: string): void {
    // First, try to get from stored role data
    const rolesData = localStorage.getItem('user_role_permissions');

    if (rolesData) {
      try {
        const rolePermissions = JSON.parse(rolesData);
        this.permissionsSubject.next(rolePermissions);
        console.log('✓ Loaded permissions from storage:', rolePermissions);
        return;
      } catch (error) {
        console.error('Error parsing role permissions:', error);
      }
    }

    // If not in storage, set default permissions based on role
    console.log('Loading default permissions for role:', roleName);
    this.setDefaultPermissions(roleName);
  }

  /**
   * Set permissions (call this after successful login)
   * FIXED: Ensure permissions are properly stored and emitted
   */
  setPermissions(permissions: UserPermissions): void {
    console.log('✓ Setting permissions:', permissions);

    // Store in BehaviorSubject (triggers subscriptions)
    this.permissionsSubject.next(permissions);

    // Store in localStorage
    localStorage.setItem('user_role_permissions', JSON.stringify(permissions));

    // Verify storage
    console.log('✓ Permissions stored. Current value:', this.permissionsSubject.value);
  }

  /**
   * Get current permissions
   * FIXED: Return current value from BehaviorSubject
   */
  getPermissions(): UserPermissions {
    const permissions = this.permissionsSubject.value;
    console.log('Getting permissions:', permissions);
    return permissions;
  }

  /**
   * Check if user has permission for a resource and action
   * FIXED: Properly handle SUPERUSER and all permissions
   */
  hasPermission(resource: string, action: string): boolean {
    const permissions = this.permissionsSubject.value;
    const userRole = this.userRoleSubject.value;

    // Superuser has all permissions
    if (userRole === 'SUPERUSER') {
      return true;
    }

    // Check for 'all' permission
    if (permissions['all']) {
      return true;
    }

    // Check specific resource permissions
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions || !Array.isArray(resourcePermissions)) {
      console.log(`No permissions found for resource: ${resource}`);
      return false;
    }

    const hasAccess = resourcePermissions.includes(action);

    if (!hasAccess) {
      console.log(`Permission denied: ${resource}:${action}`, {
        available: resourcePermissions,
        requested: action
      });
    }

    return hasAccess;
  }

  /**
   * Check if user can read a resource
   */
  canRead(resource: string): boolean {
    return this.hasPermission(resource, 'read');
  }

  /**
   * Check if user can create a resource
   */
  canCreate(resource: string): boolean {
    return this.hasPermission(resource, 'create');
  }

  /**
   * Check if user can update a resource
   */
  canUpdate(resource: string): boolean {
    return this.hasPermission(resource, 'update');
  }

  /**
   * Check if user can delete a resource
   */
  canDelete(resource: string): boolean {
    return this.hasPermission(resource, 'delete');
  }

  /**
   * Check if user has any of the specified roles
   */
  hasRole(...roles: string[]): boolean {
    const userRole = this.userRoleSubject.value;
    return roles.includes(userRole);
  }

  /**
   * Check if user has access to any permissions for a resource
   */
  hasAnyPermission(resource: string): boolean {
    return this.canRead(resource) ||
           this.canCreate(resource) ||
           this.canUpdate(resource) ||
           this.canDelete(resource);
  }

  /**
   * Set default permissions based on role name
   * COMPLETE: Matches backend roles exactly
   */
  private setDefaultPermissions(roleName: string): void {
    const defaultPermissions: { [key: string]: UserPermissions } = {
      'SUPERUSER': {
        all: []
      },
      'ADMIN': {
        users: ['create', 'read', 'update', 'delete'],
        roles: ['create', 'read', 'update', 'delete'],
        farmers: ['create', 'read', 'update', 'delete'],
        farms: ['create', 'read', 'update', 'delete'],
        quotations: ['create', 'read', 'update', 'delete'],
        claims: ['create', 'read', 'update', 'delete'],
        products: ['create', 'read', 'update', 'delete'],
        crops: ['create', 'read', 'update', 'delete'],
        seasons: ['create', 'read', 'update', 'delete'],
        advisories: ['create', 'read', 'update', 'delete'],
        weather: ['create', 'read', 'update', 'delete'],
        inspections: ['read', 'update'],
        reports: ['read'],
      },
      'MANAGER': {
        users: ['read'],
        farmers: ['read', 'update'],
        farms: ['read', 'update'],
        quotations: ['create', 'read', 'update'],
        claims: ['read', 'update'],
        products: ['read'],
        crops: ['read'],
        seasons: ['read'],
        advisories: ['create', 'read', 'update'],
        weather: ['read'],
        inspections: ['read', 'update'],
        reports: ['read'],
      },
      'ASSESSOR': {
        claims: ['read', 'update'],
        inspections: ['create', 'read', 'update'],
        farmers: ['read'],
        farms: ['read'],
        quotations: ['read'],
        weather: ['read'],
        reports: ['read'],
      },
      'AGENT': {
        farmers: ['create', 'read', 'update'],
        farms: ['create', 'read', 'update'],
        quotations: ['create', 'read', 'update'],
        claims: ['create', 'read'],
        products: ['read'],
        crops: ['read'],
        seasons: ['read'],
        weather: ['read'],
      },
      'USER': {
        farmers: ['read'],
        farms: ['read'],
        quotations: ['read'],
        claims: ['read'],
        products: ['read'],
        crops: ['read'],
        seasons: ['read'],
        weather: ['read'],
      },
      'CUSTOMER': {
        farms: ['read'],
        claims: ['create', 'read'],
        profile: ['read', 'update'],
        weather: ['read'],
        quotations: ['read'],
      },
      'API USER': {
        api: ['read', 'write']
      },
      'API_USER': {
        api: ['read', 'write']
      }
    };

    const permissions = defaultPermissions[roleName] || {};
    this.permissionsSubject.next(permissions);
    console.log('✓ Set default permissions for role:', roleName, permissions);
  }

  /**
   * Clear all permissions (call on logout)
   */
  clearPermissions(): void {
    this.permissionsSubject.next({});
    this.userRoleSubject.next('');
    localStorage.removeItem('user_role_permissions');
    console.log('✓ Permissions cleared');
  }
}
