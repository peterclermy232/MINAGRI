import { TestBed } from '@angular/core/testing';

import { AddcropService } from './addcrop.service';

describe('AddcropService', () => {
  let service: AddcropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddcropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
