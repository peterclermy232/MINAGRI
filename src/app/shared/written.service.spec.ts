import { TestBed } from '@angular/core/testing';

import { WrittenService } from './written.service';

describe('WrittenService', () => {
  let service: WrittenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WrittenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
