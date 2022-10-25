import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrganizationComponent } from './components/organizations/organization.component';
import { AccordionComponent } from './components/Organization/accordion.component';
import { BadgesComponent } from './components/badges/badges.component';


import { ChartsChartjsComponent } from './components/charts-chartjs/charts-chartjs.component';
import { FormsElementsComponent } from './components/AddOrganization/forms-elements.component';

import { IconsBootstrapComponent } from './components/icons-bootstrap/icons-bootstrap.component';
import { IconsBoxiconsComponent } from './components/icons-boxicons/icons-boxicons.component';

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

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  
  { path: 'organization', component: OrganizationComponent },
  { path: 'accordion', component: AccordionComponent },
  { path: 'badges', component: BadgesComponent },
  {path: 'assignloss', component: AssignlossComponent},
  { path: 'charts-chartjs', component: ChartsChartjsComponent },
  {path: 'manage-product', component: ManageProductComponent},
  {path: 'manage-insurance', component: ManageInsuranceComponent},
  {path: 'manage-subsidy', component: ManageSubsidyComponent},
  { path: 'form-elements', component: FormsElementsComponent },
  
  { path: 'icons-bootstrap', component: IconsBootstrapComponent },
  { path: 'icons-boxicons', component: IconsBoxiconsComponent },
  
  { path: 'tables-general', component: ManageFarmerComponent },
  
  { path: 'pages-blank', component: PagesBlankComponent },
  { path: 'pages-contact', component: PagesContactComponent },
  { path: 'pages-error404', component: PagesError404Component },
  { path: 'pages-faq', component: PagesFaqComponent },
  { path: 'pages-login', component: PagesLoginComponent },
  { path: 'pages-register', component: PagesRegisterComponent },
  { path: 'user-profile', component: UsersProfileComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
