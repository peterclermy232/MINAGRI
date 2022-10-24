import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { AccordionComponent } from './components/Organization/accordion.component';
import { BadgesComponent } from './components/badges/badges.component';

import { FormsElementsComponent } from './components/AddOrganization/forms-elements.component';
import { ManageFarmerComponent } from './components/manage-farmer/manage-farmer.component';

import { ChartsChartjsComponent } from './components/charts-chartjs/charts-chartjs.component';
import { AssignlossComponent } from './components/assignLoss/assignloss.component';
import { IconsBootstrapComponent } from './components/icons-bootstrap/icons-bootstrap.component';

import { IconsBoxiconsComponent } from './components/icons-boxicons/icons-boxicons.component';
import { UsersProfileComponent } from './pages/users-profile/users-profile.component';
import { PagesFaqComponent } from './pages/pages-faq/pages-faq.component';
import { PagesContactComponent } from './pages/pages-contact/pages-contact.component';
import { PagesRegisterComponent } from './pages/pages-register/pages-register.component';
import { PagesLoginComponent } from './pages/pages-login/pages-login.component';
import { PagesError404Component } from './pages/pages-error404/pages-error404.component';
import { PagesBlankComponent } from './pages/pages-blank/pages-blank.component';

import { ReactiveFormsModule } from '@angular/forms';
import { ManageProductComponent } from './manage-product/manage-product.component';
import { ManageInsuranceComponent } from './manage-insurance/manage-insurance.component';
import { ManageSubsidyComponent } from './manage-subsidy/manage-subsidy.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    DashboardComponent,
    OrganizationComponent,
    AccordionComponent,
    BadgesComponent,
   
    FormsElementsComponent,
    ManageFarmerComponent,
    
    ChartsChartjsComponent,
    AssignlossComponent,
    IconsBootstrapComponent,
    
    IconsBoxiconsComponent,
    UsersProfileComponent,
    PagesFaqComponent,
    PagesContactComponent,
    PagesRegisterComponent,
    PagesLoginComponent,
    PagesError404Component,
    PagesBlankComponent,
    ManageProductComponent,
    ManageInsuranceComponent,
    ManageSubsidyComponent,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
