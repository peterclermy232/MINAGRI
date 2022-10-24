import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSubsidyComponent } from './manage-subsidy.component';

describe('ManageSubsidyComponent', () => {
  let component: ManageSubsidyComponent;
  let fixture: ComponentFixture<ManageSubsidyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageSubsidyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSubsidyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
