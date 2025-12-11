import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedClaimComponent } from './approved-claim.component';

describe('ApprovedClaimComponent', () => {
  let component: ApprovedClaimComponent;
  let fixture: ComponentFixture<ApprovedClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovedClaimComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
