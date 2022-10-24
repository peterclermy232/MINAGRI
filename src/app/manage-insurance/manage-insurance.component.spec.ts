import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageInsuranceComponent } from './manage-insurance.component';

describe('ManageInsuranceComponent', () => {
  let component: ManageInsuranceComponent;
  let fixture: ComponentFixture<ManageInsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageInsuranceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
