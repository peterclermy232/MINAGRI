import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCrops } from './manage-crops.component';

describe('ManageCrops', () => {
  let component: ManageCrops;
  let fixture: ComponentFixture<ManageCrops>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCrops ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCrops);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
