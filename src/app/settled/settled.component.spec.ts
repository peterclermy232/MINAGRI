import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettledComponent } from './settled.component';

describe('SettledComponent', () => {
  let component: SettledComponent;
  let fixture: ComponentFixture<SettledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettledComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
