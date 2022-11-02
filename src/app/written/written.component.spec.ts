import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrittenComponent } from './written.component';

describe('WrittenComponent', () => {
  let component: WrittenComponent;
  let fixture: ComponentFixture<WrittenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WrittenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrittenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
