import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropVarietiesComponent } from './crop-varieties.component';

describe('CropVarietiesComponent', () => {
  let component: CropVarietiesComponent;
  let fixture: ComponentFixture<CropVarietiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CropVarietiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropVarietiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
