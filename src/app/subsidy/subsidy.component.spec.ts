import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsidyComponent } from './subsidy.component';

describe('SubsidyComponent', () => {
  let component: SubsidyComponent;
  let fixture: ComponentFixture<SubsidyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubsidyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubsidyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
