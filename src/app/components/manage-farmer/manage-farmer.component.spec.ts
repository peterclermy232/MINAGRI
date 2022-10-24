import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFarmerComponent } from './manage-farmer.component';

describe('ManageFarmerComponent', () => {
  let component: ManageFarmerComponent;
  let fixture: ComponentFixture<ManageFarmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageFarmerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFarmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
