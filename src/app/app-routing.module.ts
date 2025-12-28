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

const routes: Routes = [
  // Public routes (no authentication required)
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

  // Protected routes (authentication required)
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
  {
    path: 'organization',
    component: OrganizationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'organization-type',
    component: OrganizationTypeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'roles',
    component: RoleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'assignloss',
    component: AssignlossComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'charts-chartjs',
    component: LossAssesor,
    canActivate: [AuthGuard]
  },
  {
    path: 'settled',
    component: SettledComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'seasons',
    component: SeasonsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'written',
    component: WrittenComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-product',
    component: ManageProductComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-insurance',
    component: ManageInsuranceComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-subsidy',
    component: ManageSubsidyComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'add-organization',
    component: UsersManagementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-farmers',
    component: FarmerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-farmer',
    component: ManageFarmersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'quotation',
    component: QuotationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'insurance',
    component: SubsidyComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'paid',
    component: PaidComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'payment',
    component: PaymentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'peid',
    component: PaidClaimComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'crop',
    component: ManageCrops,
    canActivate: [AuthGuard]
  },
  {
    path: 'crop-varieties',
    component: CropVarietiesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manage-farms',
    component: ManageFarmsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'forecast',
    component: ForcastComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'advisory',
    component: AdvisoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'historical',
    component: HistoricalComponent,
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
  {
    path: 'user-profile',
    component: UsersProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'subsidy-settlement',
    canActivate: [AuthGuard],
    children: [
      { path: 'pending', component: PendingSettlementComponent },
      { path: 'approved', component: ApprovedComponent },
      { path: 'settled', component: SettledComponent }
    ]
  },
  {
    path: 'create-claim',
    component: CreateClaimComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'claims',
    canActivate: [AuthGuard],
    children: [
      { path: 'create', component: CreateClaimComponent },
      { path: 'opens', component: OpenClaimComponent },
      { path: 'pendings', component: PendingComponent },
      { path: 'approveds', component: ApprovedClaimComponent },
      { path: 'payments', component: PaymentComponent },
      { path: 'paids', component: PaidClaimComponent },
      { path: '', redirectTo: 'opens', pathMatch: 'full' }
    ]
  },

  // Wildcard route - should be last
  { path: '**', redirectTo: '/pages-error404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
