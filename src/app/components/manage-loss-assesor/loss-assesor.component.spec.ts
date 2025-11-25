import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LossAssesor } from './loss-assesor.component';

describe('LossAssesor', () => {
  let component:LossAssesor;
  let fixture: ComponentFixture<LossAssesor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LossAssesor ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LossAssesor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
