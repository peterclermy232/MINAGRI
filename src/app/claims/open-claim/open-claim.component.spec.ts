import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenClaimComponent } from './open-claim.component';

describe('OpenClaimComponent', () => {
  let component: OpenClaimComponent;
  let fixture: ComponentFixture<OpenClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenClaimComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
