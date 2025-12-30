import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrganizationComponent } from './components/organizations/organization.component';
import { OrganizationTypeComponent } from './components/Organization/organization-type.component';
import {  RoleComponent } from './components/role/role.component';

import { UsersManagementComponent } from './components/UserManagement/users-management.component';
import { ManageFarmsComponent } from './components/manage-farms/manage-farms.component';

import { AssignlossComponent } from './components/assignLoss/assignloss.component';
import { ManageCrops } from './components/manage-crops/manage-crops.component';

import { CropVarietiesComponent } from './components/crop-varieties/crop-varieties.component';
import { UsersProfileComponent } from './pages/users-profile/users-profile.component';
import { PagesFaqComponent } from './pages/pages-faq/pages-faq.component';
import { PagesContactComponent } from './pages/pages-contact/pages-contact.component';
import { PagesRegisterComponent } from './pages/pages-register/pages-register.component';
import { PagesLoginComponent } from './pages/pages-login/pages-login.component';
import { PagesError404Component } from './pages/pages-error404/pages-error404.component';
import { PagesBlankComponent } from './pages/pages-blank/pages-blank.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManageProductComponent } from './manage-product/manage-product.component';
import { ManageInsuranceComponent } from './manage-insurance/manage-insurance.component';
import { ManageSubsidyComponent } from './manage-subsidy/manage-subsidy.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FarmerComponent } from './farmer/farmer.component';
import { QuotationComponent } from './quotation/quotation.component';
import { SubsidyComponent } from './subsidy/subsidy.component';
import { PaidComponent } from './paid/paid.component';
import { PendingComponent } from './claims/pending/pending.component';
import { PaymentComponent } from './claims/payment/payment.component';
import { PaidClaimComponent } from './claims/paid-claim/paid-claim.component';
import { SeasonsComponent } from './seasons/seasons.component';
import { WrittenComponent } from './written/written.component';
import { AuthHeaderInterceptor } from './interceptors/auth-header.interceptor';
import { ApiInterceptor } from './interceptors/api.interceptor';
import { environment } from '../environments/environment';
import { DataTableComponent } from './ReUsableComponents/data-table/data-table.component';
import { ErrorSectionComponent } from './ReUsableComponents/error-section/error-section.component';
import { ForcastComponent } from './forcast/forcast.component';
import { HistoricalComponent } from './historical/historical.component';
import { AdvisoryComponent } from './components/advisory/advisory.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { LossAssesor } from './components/manage-loss-assesor/loss-assesor.component';
import { AdvisoryService } from './shared/advisory.service';
import { FilterPipe } from './pipes/filter.pipe';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { MockBackendInterceptor } from './interceptors/mock-backend.interceptor';
import { InMemoryDataService } from './shared/in-memory-data.service';
import { PendingSettlementComponent } from './subsidy-settlement/pending-settlement/pending-settlement.component';
import { InvoiceService } from './shared/invoice';
import { SettledComponent } from './subsidy-settlement/settled/settled.component';
import { ApprovedComponent } from './subsidy-settlement/approved/approved.component';
import { CreateClaimComponent } from './claims/create-claim/create-claim.component';
import { OpenClaimComponent } from './claims/open-claim/open-claim.component';
import { ApprovedClaimComponent } from './claims/approved-claim/approved-claim.component';
import { ManageFarmersComponent } from './components/manage-farmers/manage-farmers.component';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { HasRoleDirective } from './directives/has-role.directive';
import { AuthService } from './shared/auth.service';
import { PermissionService } from './shared/permission.service';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { PermissionGuard } from './guards/permission.guard';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    DashboardComponent,
    OrganizationComponent,
    OrganizationTypeComponent,
    RoleComponent,
    ErrorSectionComponent,

    UsersManagementComponent,
    ManageFarmsComponent,

    LossAssesor,
    AssignlossComponent,
    WrittenComponent,
     ManageCrops,

    CropVarietiesComponent,
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
    SubsidyComponent,
    PaidComponent,
    PendingComponent,
    PaymentComponent,
    PaidClaimComponent,
    SeasonsComponent,
    ForcastComponent,
    HistoricalComponent,
    AdvisoryComponent,
    FilterPipe,
    PendingSettlementComponent,
    ApprovedComponent,
    SettledComponent,
    CreateClaimComponent,
    OpenClaimComponent,
    ApprovedClaimComponent,
    ManageFarmersComponent,
    HasPermissionDirective,  // Add directive
    HasRoleDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxPaginationModule,
    // HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
    //      dataEncapsulation: false,
    //      delay: 500, // Simulated network delay (ms)
    //      passThruUnknownUrl: true,
    //      //apiBase: 'api/v1/',
    //    }),

  ],
  providers: [
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass:AuthHeaderInterceptor,
    //   multi: true,
    // },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: MockBackendInterceptor,
    //   multi: true,
    // },
    AuthService,
    PermissionService,
    AuthGuard,
    LoginGuard,
    PermissionGuard,
    // AdvisoryService,
    // InvoiceService,
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
