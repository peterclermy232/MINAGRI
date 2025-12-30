import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { PermissionService } from '../../shared/permission.service';
import { Subscription } from 'rxjs';

interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  roles?: string[];
  permission?: { resource: string; action: string };
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  userRole: string = '';
  userName: string = '';
  menuItems: MenuItem[] = [];
  private permissionSubscription?: Subscription;

  private allMenuItems: MenuItem[] = [
    // DASHBOARD - All authenticated users
    {
      label: 'Dashboard',
      icon: 'bi-grid',
      route: '/dashboard',
      roles: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'ASSESSOR', 'USER', 'CUSTOMER']
    },

    // POLICY ADMINISTRATION
    {
      label: 'Policy Administration',
      icon: 'bi-layout-text-window-reverse',
      roles: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER', 'CUSTOMER'],
      children: [
        {
          label: 'Farmer Register',
          route: '/manage-farmer',
          permission: { resource: 'farmers', action: 'read' }
        },
        {
          label: 'Manage Farms',
          route: '/manage-farms',
          permission: { resource: 'farms', action: 'read' }
        },
        {
          label: 'Open Quotation',
          route: '/quotation',
          permission: { resource: 'quotations', action: 'create' }
        },
        {
          label: 'Paid Quotation',
          route: '/paid',
          permission: { resource: 'quotations', action: 'read' }
        },
        {
          label: 'Subsidy Approved Quotation',
          route: '/insurance',
          roles: ['SUPERUSER', 'ADMIN', 'MANAGER'],
          permission: { resource: 'quotations', action: 'update' }
        },
        {
          label: 'Written Policy',
          route: '/written',
          roles: ['SUPERUSER', 'ADMIN', 'MANAGER']
        }
      ]
    },

    // SUBSIDY SETTLEMENT
    {
      label: 'Subsidy Settlement',
      icon: 'bi-cash-stack',
      roles: ['SUPERUSER', 'ADMIN', 'MANAGER'],
      children: [
        {
          label: 'Approved Invoice',
          route: '/subsidy-settlement/approved'
        },
        {
          label: 'Pending Settlement',
          route: '/subsidy-settlement/pending'
        },
        {
          label: 'Settled Invoice',
          route: '/subsidy-settlement/settled'
        }
      ]
    },

    // CLAIM MANAGEMENT
    {
      label: 'Claim Management',
      icon: 'bi-file-earmark-medical',
      roles: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'ASSESSOR', 'USER', 'CUSTOMER'],
      children: [
        {
          label: 'Create Claim',
          route: '/claims/create',
          permission: { resource: 'claims', action: 'create' }
        },
        {
          label: 'Open Claims',
          route: '/claims/opens',
          permission: { resource: 'claims', action: 'read' }
        },
        {
          label: 'Pending Assessment',
          route: '/claims/pendings',
          permission: { resource: 'claims', action: 'update' }
        },
        {
          label: 'Approved Claims',
          route: '/claims/approveds',
          roles: ['SUPERUSER', 'ADMIN', 'MANAGER']
        },
        {
          label: 'Payment Processing',
          route: '/claims/payments',
          roles: ['SUPERUSER', 'ADMIN', 'MANAGER']
        },
        {
          label: 'Paid Claims',
          route: '/claims/paids',
          roles: ['SUPERUSER', 'ADMIN', 'MANAGER']
        }
      ]
    },

    // PRODUCT MANAGEMENT
    {
      label: 'Product Management',
      icon: 'bi-box-seam',
      roles: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER'],
      children: [
        {
          label: 'Crops',
          route: '/crop',
          permission: { resource: 'crops', action: 'read' }
        },
        {
          label: 'Crop Varieties',
          route: '/crop-varieties',
          permission: { resource: 'crops', action: 'read' }
        },
        {
          label: 'Seasons',
          route: '/seasons',
          permission: { resource: 'seasons', action: 'read' }
        },
        {
          label: 'Product Categories',
          route: '/manage-product',
          permission: { resource: 'products', action: 'read' }
        },
        {
          label: 'Product Insurance',
          route: '/manage-insurance',
          permission: { resource: 'products', action: 'read' }
        },
        {
          label: 'Subsidy',
          route: '/manage-subsidy',
          roles: ['SUPERUSER', 'ADMIN']
        },
        {
          label: 'Insurance Loss Assessors',
          route: '/assignloss',
          roles: ['SUPERUSER', 'ADMIN']
        }
      ]
    },

    // WEATHER & CLIMATE
    {
      label: 'Weather and Climate',
      icon: 'bi-cloud-rain',
      roles: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'ASSESSOR', 'USER', 'CUSTOMER'],
      children: [
        {
          label: 'Forecast Data',
          route: '/forecast',
          permission: { resource: 'weather', action: 'read' }
        },
        {
          label: 'Historical Data',
          route: '/historical',
          permission: { resource: 'weather', action: 'read' }
        }
      ]
    },

    // ADVISORY SERVICES
    {
      label: 'Advisory Services',
      icon: 'bi-megaphone',
      roles: ['SUPERUSER', 'ADMIN', 'MANAGER'],
      children: [
        {
          label: 'Advisory',
          route: '/advisory',
          permission: { resource: 'advisories', action: 'read' }
        }
      ]
    },

    // ADMINISTRATION
    {
      label: 'Administration',
      icon: 'bi-gear',
      roles: ['SUPERUSER', 'ADMIN'],
      children: [
        {
          label: 'Organisation Type',
          route: '/organization-type'
        },
        {
          label: 'Organisation',
          route: '/organization'
        },
        {
          label: 'Roles',
          route: '/roles',
          permission: { resource: 'roles', action: 'read' }
        },
        {
          label: 'Users',
          route: '/add-organization',
          permission: { resource: 'users', action: 'read' }
        }
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();

    // Subscribe to permission changes
    this.permissionSubscription = this.permissionService.permissions$.subscribe(permissions => {
      if (Object.keys(permissions).length > 0) {
        console.log('Permissions updated:', permissions);
        this.buildMenu();
      }
    });

    // Fallback build
    setTimeout(() => {
      this.buildMenu();
    }, 500);
  }

  ngOnDestroy(): void {
    this.permissionSubscription?.unsubscribe();
  }

  private loadUserInfo(): void {
    const user = this.authService.getCurrentUser();
    this.userRole = this.authService.getUserRole() || 'USER';
    this.userName = user?.user_name || user?.username || 'Guest';

    console.log('=== SIDEBAR USER INFO ===');
    console.log('User:', this.userName);
    console.log('Role:', this.userRole);
  }

  private buildMenu(): void {
    console.log('\n=== BUILDING MENU START ===');
    console.log('Current Role:', this.userRole);
    console.log('Current Permissions:', this.permissionService.getPermissions());

    this.menuItems = this.allMenuItems
      .map(item => {
        console.log(`\n--- Checking Parent: ${item.label} ---`);

        // Check parent access
        const parentAccess = this.canAccessMenuItem(item);
        console.log(`Parent role check: ${parentAccess ? '✓' : '❌'}`);

        if (!parentAccess) {
          return null;
        }

        // Filter children
        if (item.children) {
          console.log(`Checking ${item.children.length} children...`);

          const accessibleChildren = item.children.filter(child => {
            const childAccess = this.canAccessMenuItem(child);
            const reason = this.getAccessDeniedReason(child);

            console.log(`  ${childAccess ? '✓' : '❌'} ${child.label}${reason ? ` (${reason})` : ''}`);

            return childAccess;
          });

          console.log(`Result: ${accessibleChildren.length}/${item.children.length} children accessible`);

          if (accessibleChildren.length === 0) {
            console.log(`❌ Hiding parent - no accessible children`);
            return null;
          }

          return { ...item, children: accessibleChildren };
        }

        return item;
      })
      .filter(item => item !== null) as MenuItem[];

    console.log('\n=== MENU BUILD COMPLETE ===');
    console.log('Total menu items:', this.menuItems.length);
    console.log('Items:', this.menuItems.map(i => `${i.label} (${i.children?.length || 0} children)`));
    console.log('===========================\n');
  }

  private canAccessMenuItem(item: MenuItem): boolean {
    // SUPERUSER has access to everything
    if (this.userRole === 'SUPERUSER') {
      return true;
    }

    // Check role requirement
    if (item.roles && item.roles.length > 0) {
      if (!item.roles.includes(this.userRole)) {
        return false;
      }
    }

    // Check permission requirement
    if (item.permission) {
      return this.permissionService.hasPermission(
        item.permission.resource,
        item.permission.action
      );
    }

    return true;
  }

  private getAccessDeniedReason(item: MenuItem): string | null {
    if (this.userRole === 'SUPERUSER') {
      return null;
    }

    if (item.roles && !item.roles.includes(this.userRole)) {
      return `role not in [${item.roles.join(', ')}]`;
    }

    if (item.permission) {
      const hasPermission = this.permissionService.hasPermission(
        item.permission.resource,
        item.permission.action
      );

      if (!hasPermission) {
        return `missing ${item.permission.resource}:${item.permission.action}`;
      }
    }

    return null;
  }

  navigateTo(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  hasChildren(item: MenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  getMenuId(label: string): string {
    return label.toLowerCase().replace(/\s+/g, '-') + '-nav';
  }

  canCreate(resource: string): boolean {
    return this.permissionService.canCreate(resource);
  }

  canUpdate(resource: string): boolean {
    return this.permissionService.canUpdate(resource);
  }

  canDelete(resource: string): boolean {
    return this.permissionService.canDelete(resource);
  }
}
