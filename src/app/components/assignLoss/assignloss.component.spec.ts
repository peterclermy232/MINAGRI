import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignlossComponent } from './assignloss.component';

describe('AssignlossComponent', () => {
  let component: AssignlossComponent;
  let fixture: ComponentFixture<AssignlossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignlossComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignlossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
