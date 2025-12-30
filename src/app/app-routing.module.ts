import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrganizationComponent } from './components/organizations/organization.component';
import { OrganizationTypeComponent } from './components/Organization/organization-type.component';
import { RoleComponent } from './components/role/role.component';
import { LossAssesor } from './components/manage-loss-assesor/loss-assesor.component';
import { UsersManagementComponent } from './components/UserManagement/users-management.component';
import { ManageCrops } from './components/manage-crops/manage-crops.component';
import { CropVarietiesComponent } from './components/crop-varieties/crop-varieties.component';
import { ManageFarmsComponent } from './components/manage-farms/manage-farms.component';
import { PagesBlankComponent } from './pages/pages-blank/pages-blank.component';
import { PagesContactComponent } from './pages/pages-contact/pages-contact.component';
import { PagesError404Component } from './pages/pages-error404/pages-error404.component';
import { PagesFaqComponent } from './pages/pages-faq/pages-faq.component';
import { PagesLoginComponent } from './pages/pages-login/pages-login.component';
import { PagesRegisterComponent } from './pages/pages-register/pages-register.component';
import { UsersProfileComponent } from './pages/users-profile/users-profile.component';
import { ManageProductComponent } from './manage-product/manage-product.component';
import { ManageInsuranceComponent } from './manage-insurance/manage-insurance.component';
import { ManageSubsidyComponent } from './manage-subsidy/manage-subsidy.component';
import { AssignlossComponent } from './components/assignLoss/assignloss.component';
import { FarmerComponent } from './farmer/farmer.component';
import { QuotationComponent } from './quotation/quotation.component';
import { SubsidyComponent } from './subsidy/subsidy.component';
import { PaidComponent } from './paid/paid.component';
import { PaymentComponent } from './claims/payment/payment.component';
import { PaidClaimComponent } from './claims/paid-claim/paid-claim.component';
import { SeasonsComponent } from './seasons/seasons.component';
import { WrittenComponent } from './written/written.component';
import { ForcastComponent } from './forcast/forcast.component';
import { HistoricalComponent } from './historical/historical.component';
import { AdvisoryComponent } from './components/advisory/advisory.component';
import { PendingSettlementComponent } from './subsidy-settlement/pending-settlement/pending-settlement.component';
import { SettledComponent } from './subsidy-settlement/settled/settled.component';
import { ApprovedComponent } from './subsidy-settlement/approved/approved.component';
import { CreateClaimComponent } from './claims/create-claim/create-claim.component';
import { ApprovedClaimComponent } from './claims/approved-claim/approved-claim.component';
import { PendingComponent } from './claims/pending/pending.component';
import { OpenClaimComponent } from './claims/open-claim/open-claim.component';
import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';
import { ManageFarmersComponent } from './components/manage-farmers/manage-farmers.component';
import { PermissionGuard } from './guards/permission.guard';

/**
 * Routes aligned with backend Django permissions
 *
 * Backend Role Permissions (from seed_roles.py):
 *
 * SUPERUSER: Full access (all: true)
 *
 * ADMIN:
 *   - users: create, read, update, delete
 *   - roles: create, read, update, delete
 *   - farmers: create, read, update, delete
 *   - farms: create, read, update, delete
 *   - quotations: create, read, update, delete
 *   - claims: create, read, update, delete
 *   - products: create, read, update, delete
 *   - crops: create, read, update, delete
 *   - seasons: create, read, update, delete
 *   - advisories: create, read, update, delete
 *   - weather: create, read, update, delete
 *   - inspections: read, update
 *   - reports: read
 *
 * MANAGER:
 *   - users: read
 *   - farmers: read, update
 *   - farms: read, update
 *   - quotations: create, read, update
 *   - claims: read, update
 *   - products: read
 *   - crops: read
 *   - seasons: read
 *   - advisories: create, read, update
 *   - weather: read
 *   - inspections: read, update
 *   - reports: read
 *
 * ASSESSOR:
 *   - claims: read, update
 *   - inspections: create, read, update
 *   - farmers: read
 *   - farms: read
 *   - quotations: read
 *   - weather: read
 *   - reports: read
 *
 * AGENT:
 *   - farmers: create, read, update
 *   - farms: create, read, update
 *   - quotations: create, read, update
 *   - claims: create, read
 *   - products: read
 *   - crops: read
 *   - seasons: read
 *   - weather: read
 *
 * USER:
 *   - farmers: read
 *   - farms: read
 *   - quotations: read
 *   - claims: read
 *   - products: read
 *   - crops: read
 *   - seasons: read
 *   - weather: read
 */

const routes: Routes = [
  // ==================== PUBLIC ROUTES ====================
  {
    path: '',
    component: PagesLoginComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'login',
    component: PagesLoginComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'register',
    component: PagesRegisterComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'pages-error404',
    component: PagesError404Component
  },

  // ==================== DASHBOARD (ALL AUTHENTICATED USERS) ====================
  {
    path: 'home',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },

  // ==================== ADMINISTRATION (SUPERUSER, ADMIN) ====================
  {
    path: 'organization',
    component: OrganizationComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      role: ['SUPERUSER', 'ADMIN'],
      description: 'Manage Organizations'
    }
  },
  {
    path: 'organization-type',
    component: OrganizationTypeComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      role: ['SUPERUSER', 'ADMIN'],
      description: 'Manage Organization Types'
    }
  },
  {
    path: 'roles',
    component: RoleComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      // Only SUPERUSER and ADMIN can access the roles management page
      // But backend controls who can create/update/delete
      role: ['SUPERUSER', 'ADMIN'],
      description: 'Manage User Roles'
    }
  },
  {
    path: 'add-organization',
    component: UsersManagementComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'users:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER'],
      description: 'Manage Users'
    }
  },

  // ==================== FARMER MANAGEMENT ====================
  {
    path: 'manage-farmer',
    component: ManageFarmersComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'farmers:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER'],
      description: 'Farmer Register - View and manage farmers'
    }
  },

  // ==================== FARM MANAGEMENT ====================
  {
    path: 'manage-farms',
    component: ManageFarmsComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'farms:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER'],
      description: 'Manage Farms'
    }
  },

  // ==================== QUOTATION/POLICY MANAGEMENT ====================
  {
    path: 'quotation',
    component: QuotationComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'quotations:create',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT'],
      description: 'Open Quotations - Create new quotations'
    }
  },
  {
    path: 'paid',
    component: PaidComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'quotations:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER'],
      description: 'Paid Quotations'
    }
  },
  {
    path: 'insurance',
    component: SubsidyComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'quotations:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER'],
      description: 'Subsidy Approved Quotations'
    }
  },
  {
    path: 'written',
    component: WrittenComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'quotations:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER'],
      description: 'Written Policies'
    }
  },

  // ==================== SUBSIDY SETTLEMENT (ADMIN, MANAGER) ====================
  {
    path: 'subsidy-settlement',
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      role: ['SUPERUSER', 'ADMIN', 'MANAGER']
    },
    children: [
      {
        path: 'approved',
        component: ApprovedComponent,
        data: { description: 'Approved Invoices' }
      },
      {
        path: 'pending',
        component: PendingSettlementComponent,
        data: { description: 'Pending Settlement' }
      },
      {
        path: 'settled',
        component: SettledComponent,
        data: { description: 'Settled Invoices' }
      }
    ]
  },

  // ==================== CLAIM MANAGEMENT ====================
  {
    path: 'claims',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'create',
        component: CreateClaimComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 'claims:create',
          role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT'],
          description: 'Create New Claim'
        }
      },
      {
        path: 'opens',
        component: OpenClaimComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 'claims:read',
          role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'ASSESSOR', 'AGENT', 'USER'],
          description: 'Open Claims'
        }
      },
      {
        path: 'pendings',
        component: PendingComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 'claims:read',
          role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'ASSESSOR'],
          description: 'Claims Pending Assessment'
        }
      },
      {
        path: 'approveds',
        component: ApprovedClaimComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 'claims:read',
          role: ['SUPERUSER', 'ADMIN', 'MANAGER'],
          description: 'Approved Claims'
        }
      },
      {
        path: 'payments',
        component: PaymentComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 'claims:update',
          role: ['SUPERUSER', 'ADMIN', 'MANAGER'],
          description: 'Claims Payment Processing'
        }
      },
      {
        path: 'paids',
        component: PaidClaimComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: 'claims:read',
          role: ['SUPERUSER', 'ADMIN', 'MANAGER'],
          description: 'Paid Claims'
        }
      },
      {
        path: '',
        redirectTo: 'opens',
        pathMatch: 'full'
      }
    ]
  },

  // ==================== PRODUCT MANAGEMENT ====================
  {
    path: 'crop',
    component: ManageCrops,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'crops:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER'],
      description: 'Manage Crops'
    }
  },
  {
    path: 'crop-varieties',
    component: CropVarietiesComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'crops:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER'],
      description: 'Manage Crop Varieties'
    }
  },
  {
    path: 'seasons',
    component: SeasonsComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'seasons:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER'],
      description: 'Manage Seasons'
    }
  },
  {
    path: 'manage-product',
    component: ManageProductComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'products:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER'],
      description: 'Product Categories'
    }
  },
  {
    path: 'manage-insurance',
    component: ManageInsuranceComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'products:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'USER'],
      description: 'Insurance Products'
    }
  },
  {
    path: 'manage-subsidy',
    component: ManageSubsidyComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      role: ['SUPERUSER', 'ADMIN', 'MANAGER'],
      description: 'Manage Subsidies'
    }
  },
  {
    path: 'assignloss',
    component: AssignlossComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      role: ['SUPERUSER', 'ADMIN', 'MANAGER'],
      description: 'Insurance Loss Assessors'
    }
  },

  // ==================== WEATHER & CLIMATE ====================
  {
    path: 'forecast',
    component: ForcastComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'weather:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'ASSESSOR', 'USER'],
      description: 'Weather Forecast'
    }
  },
  {
    path: 'historical',
    component: HistoricalComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'weather:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER', 'AGENT', 'ASSESSOR', 'USER'],
      description: 'Historical Weather Data'
    }
  },

  // ==================== ADVISORY SERVICES ====================
  {
    path: 'advisory',
    component: AdvisoryComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permission: 'advisories:read',
      role: ['SUPERUSER', 'ADMIN', 'MANAGER'],
      description: 'Advisory Services'
    }
  },

  // ==================== OTHER PAGES ====================
  {
    path: 'user-profile',
    component: UsersProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pages-blank',
    component: PagesBlankComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pages-contact',
    component: PagesContactComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pages-faq',
    component: PagesFaqComponent,
    canActivate: [AuthGuard]
  },

  // ==================== WILDCARD (MUST BE LAST) ====================
  {
    path: '**',
    redirectTo: '/pages-error404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
