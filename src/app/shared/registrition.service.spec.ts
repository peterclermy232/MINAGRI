import { TestBed } from '@angular/core/testing';

import { RegistritionService } from './registrition.service';

describe('RegistritionService', () => {
  let service: RegistritionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistritionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
