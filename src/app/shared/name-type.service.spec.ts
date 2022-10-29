import { TestBed } from '@angular/core/testing';

import { NameTypeService } from './name-type.service';

describe('NameTypeService', () => {
  let service: NameTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NameTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
