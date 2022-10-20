import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTypeComponent } from './organization-type.component';

describe('OrganizationTypeComponent', () => {
  let component: OrganizationTypeComponent;
  let fixture: ComponentFixture<OrganizationTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
