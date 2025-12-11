import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaidClaimComponent } from './paid-claim.component';

describe('PaidClaimComponent', () => {
  let component: PaidClaimComponent;
  let fixture: ComponentFixture<PaidClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaidClaimComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaidClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
