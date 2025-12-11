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

import { ManageFarmerComponent } from './components/manage-farmer/manage-farmer.component';

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
import { ClaimComponent } from './components/claim/claim.component';
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

const routes: Routes = [
  { path: '', component: PagesLoginComponent },
  { path: 'login', component: PagesLoginComponent },
  { path: 'register', component: PagesRegisterComponent },
  { path: 'home', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'organization', component: OrganizationComponent },
  { path: 'organization-type', component: OrganizationTypeComponent },
  { path: 'roles', component: RoleComponent },
  {path: 'assignloss', component: AssignlossComponent},
  { path: 'charts-chartjs', component: LossAssesor },
  {path: 'settled', component: SettledComponent},
  {path: 'seasons', component: SeasonsComponent},
  {path: 'written', component: WrittenComponent},

  {path: 'manage-product', component: ManageProductComponent},
  {path: 'manage-insurance', component: ManageInsuranceComponent},
  {path: 'manage-subsidy', component: ManageSubsidyComponent},
  { path: 'add-organization', component: UsersManagementComponent },
  {path: 'farmer', component: FarmerComponent},
  {path: 'quotation', component: QuotationComponent},
  {path: 'insurance', component: SubsidyComponent},
  {path: 'paid', component: PaidComponent},
  {path: 'payment', component: PaymentComponent},
  {path: 'peid', component: PaidClaimComponent },
  {path: 'claim', component: ClaimComponent},
  { path: 'crop', component: ManageCrops },
  { path: 'crop-varieties', component: CropVarietiesComponent },

  { path: 'manage-farmer', component: ManageFarmerComponent },
  {path: 'forecast', component: ForcastComponent},
  {path:'advisory', component: AdvisoryComponent},
  {path: 'historical', component: HistoricalComponent},
  { path: 'pages-blank', component: PagesBlankComponent },
  { path: 'pages-contact', component: PagesContactComponent },
  { path: 'pages-error404', component: PagesError404Component },
  { path: 'pages-faq', component: PagesFaqComponent },

  { path: 'user-profile', component: UsersProfileComponent },
  {
    path: 'subsidy-settlement',
    children: [
      { path: 'pending', component: PendingSettlementComponent },
      { path: 'approved', component: ApprovedComponent },
      { path: 'settled', component: SettledComponent }
    ]
  },
  { path: 'create-claim', component: CreateClaimComponent },
  {
    path: 'claims',
    children: [
      { path: 'create', component: CreateClaimComponent },
      { path: 'open', component: OpenClaimComponent },
      { path: 'pending', component: PendingComponent },
      { path: 'approved', component: ApprovedClaimComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'paid', component: PaidClaimComponent },
      { path: '', redirectTo: 'open', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
