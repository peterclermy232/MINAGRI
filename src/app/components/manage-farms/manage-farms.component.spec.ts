import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFarmsComponent } from './manage-farms.component';

describe('ManageFarmsComponent', () => {
  let component: ManageFarmsComponent;
  let fixture: ComponentFixture<ManageFarmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageFarmsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFarmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
