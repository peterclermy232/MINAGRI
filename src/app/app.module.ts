import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrganizationComponent } from './components/organizations/organization.component';
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
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FarmerComponent } from './farmer/farmer.component';
import { QuotationComponent } from './quotation/quotation.component';
import { InsuranceComponent } from './insurance/insurance.component';
import { PaidComponent } from './paid/paid.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ApprovedComponent } from './approved/approved.component';
import { PendingComponent } from './pending/pending.component';
import { SettledComponent } from './settled/settled.component';
import { ClaimComponent } from './claim/claim.component';
import { PaymentComponent } from './payment/payment.component';
import { PaidClaimComponent } from './paid-claim/paid-claim.component';
import { SeasonsComponent } from './seasons/seasons.component';
import { WrittenComponent } from './written/written.component';
import { AuthHeaderInterceptor } from './interceptors/auth-header.interceptor';
import { ApiInterceptor } from './interceptors/api.interceptor';
import { environment } from '../environments/environment';
import { DataTableComponent } from './ReUsableComponents/data-table/data-table.component';
import { ErrorSectionComponent } from './ReUsableComponents/error-section/error-section.component';

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
    FarmerComponent,
    QuotationComponent,
    InsuranceComponent,
    PaidComponent,
    InvoiceComponent,
    ApprovedComponent,
    PendingComponent,
    SettledComponent,
    ClaimComponent,
    PaymentComponent,
    PaidClaimComponent,
    SeasonsComponent,
    WrittenComponent,
    DataTableComponent,
    ErrorSectionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthHeaderInterceptor,
    //   multi: true,
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    { provide: 'OAUTH_BASE_URL', useValue: environment.oauth_baseurl },
    { provide: 'CROP_BASE_URL', useValue: environment.crop_baseurl },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
