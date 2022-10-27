import { TestBed } from '@angular/core/testing';

import { LossService } from './loss.service';

describe('LossService', () => {
  let service: LossService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LossService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
